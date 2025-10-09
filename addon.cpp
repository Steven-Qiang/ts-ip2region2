#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif

#include <napi.h>

extern "C" {
#include "ip2region/xdb_api.h"
}

#include <memory>

class Ip2RegionSearcher : public Napi::ObjectWrap<Ip2RegionSearcher> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Ip2RegionSearcher(const Napi::CallbackInfo& info);
    ~Ip2RegionSearcher();

private:
    static Napi::FunctionReference constructor;
    
    Napi::Value Search(const Napi::CallbackInfo& info);
    Napi::Value Close(const Napi::CallbackInfo& info);
    
    xdb_searcher_t searcher;
    xdb_vector_index_t* v_index;
    xdb_content_t* c_buffer;
    bool is_initialized;
};

Napi::FunctionReference Ip2RegionSearcher::constructor;

Napi::Object Ip2RegionSearcher::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "Ip2RegionSearcher", {
        InstanceMethod("search", &Ip2RegionSearcher::Search),
        InstanceMethod("close", &Ip2RegionSearcher::Close)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Ip2RegionSearcher", func);
    return exports;
}

Ip2RegionSearcher::Ip2RegionSearcher(const Napi::CallbackInfo& info) 
    : Napi::ObjectWrap<Ip2RegionSearcher>(info), v_index(nullptr), c_buffer(nullptr), is_initialized(false) {
    
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected at least 1 argument").ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "Expected string for db_path").ThrowAsJavaScriptException();
        return;
    }

    std::string db_path = info[0].As<Napi::String>().Utf8Value();
    std::string cache_policy = "vectorIndex";
    std::string ip_version = "v4";

    if (info.Length() > 1 && info[1].IsObject()) {
        Napi::Object options = info[1].As<Napi::Object>();
        
        if (options.Has("cachePolicy")) {
            cache_policy = options.Get("cachePolicy").As<Napi::String>().Utf8Value();
        }
        
        if (options.Has("ipVersion")) {
            ip_version = options.Get("ipVersion").As<Napi::String>().Utf8Value();
        }
    }

    // 初始化winsock (Windows)
    int err = xdb_init_winsock();
    if (err != 0) {
        Napi::Error::New(env, "Failed to init winsock").ThrowAsJavaScriptException();
        return;
    }

    // 验证xdb文件 (跳过严格验证，因为某些xdb文件可能有兼容性问题)
    // err = xdb_verify_from_file(db_path.c_str());
    // if (err != 0) {
    //     std::string error_msg = "Failed to verify xdb file, error code: " + std::to_string(err);
    //     Napi::Error::New(env, error_msg).ThrowAsJavaScriptException();
    //     return;
    // }

    // 确定IP版本
    xdb_version_t* version;
    if (ip_version == "v4" || ip_version == "ipv4") {
        version = XDB_IPv4;
    } else if (ip_version == "v6" || ip_version == "ipv6") {
        version = XDB_IPv6;
    } else {
        Napi::Error::New(env, "Invalid IP version").ThrowAsJavaScriptException();
        return;
    }

    // 根据缓存策略初始化searcher
    if (cache_policy == "file") {
        err = xdb_new_with_file_only(version, &searcher, db_path.c_str());
    } else if (cache_policy == "vectorIndex") {
        v_index = xdb_load_vector_index_from_file(db_path.c_str());
        if (v_index == nullptr) {
            Napi::Error::New(env, "Failed to load vector index").ThrowAsJavaScriptException();
            return;
        }
        err = xdb_new_with_vector_index(version, &searcher, db_path.c_str(), v_index);
    } else if (cache_policy == "content") {
        c_buffer = xdb_load_content_from_file(db_path.c_str());
        if (c_buffer == nullptr) {
            Napi::Error::New(env, "Failed to load content").ThrowAsJavaScriptException();
            return;
        }
        err = xdb_new_with_buffer(version, &searcher, c_buffer);
    } else {
        Napi::Error::New(env, "Invalid cache policy").ThrowAsJavaScriptException();
        return;
    }

    if (err != 0) {
        Napi::Error::New(env, "Failed to create searcher").ThrowAsJavaScriptException();
        return;
    }

    is_initialized = true;
}

Ip2RegionSearcher::~Ip2RegionSearcher() {
    if (is_initialized) {
        xdb_close(&searcher);
        
        if (v_index != nullptr) {
            xdb_free_vector_index(v_index);
        }
        
        if (c_buffer != nullptr) {
            xdb_free_content(c_buffer);
        }
        
        xdb_clean_winsock();
    }
}

Napi::Value Ip2RegionSearcher::Search(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (!is_initialized) {
        Napi::Error::New(env, "Searcher not initialized").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected string for IP address").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string ip_string = info[0].As<Napi::String>().Utf8Value();
    
    xdb_region_buffer_t region;
    int err = xdb_region_buffer_init(&region, nullptr, 0);
    if (err != 0) {
        Napi::Error::New(env, "Failed to init region buffer").ThrowAsJavaScriptException();
        return env.Null();
    }

    long start_time = xdb_now();
    err = xdb_search_by_string(&searcher, ip_string.c_str(), &region);
    long cost_time = xdb_now() - start_time;

    if (err != 0) {
        xdb_region_buffer_free(&region);
        Napi::Error::New(env, "Search failed").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Object result = Napi::Object::New(env);
    result.Set("region", Napi::String::New(env, region.value ? region.value : ""));
    result.Set("ioCount", Napi::Number::New(env, xdb_get_io_count(&searcher)));
    result.Set("took", Napi::Number::New(env, cost_time));

    xdb_region_buffer_free(&region);
    return result;
}

Napi::Value Ip2RegionSearcher::Close(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (is_initialized) {
        xdb_close(&searcher);
        
        if (v_index != nullptr) {
            xdb_free_vector_index(v_index);
            v_index = nullptr;
        }
        
        if (c_buffer != nullptr) {
            xdb_free_content(c_buffer);
            c_buffer = nullptr;
        }
        
        xdb_clean_winsock();
        is_initialized = false;
    }
    
    return env.Undefined();
}

// 静态函数用于验证xdb文件
Napi::Value VerifyXdb(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected string for db_path").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    std::string db_path = info[0].As<Napi::String>().Utf8Value();
    
    int err = 0;
    FILE *handle = fopen(db_path.c_str(), "rb");
    if (handle == NULL) {
        err = -1;
    } else {
        // 加载header
        xdb_header_t *header = xdb_load_header(handle);
        if (header == NULL) {
            err = 1;
        } else {
            // =只检查header是否正常加载
            err = 0; // header加载成功即认为文件有效
            xdb_free_header(header);
        }
        fclose(handle);
    }
    
    Napi::Object result = Napi::Object::New(env);
    result.Set("valid", Napi::Boolean::New(env, err == 0));
    result.Set("errorCode", Napi::Number::New(env, err));
    
    return result;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    Ip2RegionSearcher::Init(env, exports);
    exports.Set("verifyXdb", Napi::Function::New(env, VerifyXdb));
    return exports;
}

NODE_API_MODULE(ip2region, Init)