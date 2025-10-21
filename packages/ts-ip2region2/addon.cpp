#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif

#include <napi.h>
#include <string>
#include <cstdio>

extern "C" {
#include "ip2region/xdb_api.h"
}

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

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected database path as string").ThrowAsJavaScriptException();
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

    // Initialize winsock (Windows only)
    int err = xdb_init_winsock();
    if (err != 0) {
        Napi::Error::New(env, "Failed to initialize network layer").ThrowAsJavaScriptException();
        return;
    }

    // Determine IP version
    xdb_version_t* version = (ip_version == "v4" || ip_version == "ipv4") ? XDB_IPv4 : 
                            (ip_version == "v6" || ip_version == "ipv6") ? XDB_IPv6 : nullptr;
    
    if (!version) {
        xdb_clean_winsock();
        Napi::Error::New(env, "Invalid IP version. Use 'v4' or 'v6'").ThrowAsJavaScriptException();
        return;
    }

    // Initialize searcher based on cache strategy
    if (cache_policy == "file") {
        err = xdb_new_with_file_only(version, &searcher, db_path.c_str());
    } else if (cache_policy == "vectorIndex") {
        v_index = xdb_load_vector_index_from_file(db_path.c_str());
        if (!v_index) {
            xdb_clean_winsock();
            Napi::Error::New(env, "Failed to load vector index from database file").ThrowAsJavaScriptException();
            return;
        }
        err = xdb_new_with_vector_index(version, &searcher, db_path.c_str(), v_index);
    } else if (cache_policy == "content") {
        c_buffer = xdb_load_content_from_file(db_path.c_str());
        if (!c_buffer) {
            xdb_clean_winsock();
            Napi::Error::New(env, "Failed to load database content into memory").ThrowAsJavaScriptException();
            return;
        }
        err = xdb_new_with_buffer(version, &searcher, c_buffer);
    } else {
        xdb_clean_winsock();
        Napi::Error::New(env, "Invalid cache policy. Use 'file', 'vectorIndex', or 'content'").ThrowAsJavaScriptException();
        return;
    }

    if (err != 0) {
        if (v_index) xdb_free_vector_index(v_index);
        if (c_buffer) xdb_free_content(c_buffer);
        xdb_clean_winsock();
        Napi::Error::New(env, "Failed to initialize IP geolocation searcher").ThrowAsJavaScriptException();
        return;
    }

    is_initialized = true;
}

Ip2RegionSearcher::~Ip2RegionSearcher() {
    if (is_initialized) {
        xdb_close(&searcher);
        if (v_index) {
            xdb_free_vector_index(v_index);
            v_index = nullptr;
        }
        if (c_buffer) {
            xdb_free_content(c_buffer);
            c_buffer = nullptr;
        }
        xdb_clean_winsock();
        is_initialized = false;
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
        Napi::TypeError::New(env, "Expected IP address as string").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string ip_string = info[0].As<Napi::String>().Utf8Value();
    
    xdb_region_buffer_t region;
    int err = xdb_region_buffer_init(&region, nullptr, 0);
    if (err != 0) {
        Napi::Error::New(env, "Failed to initialize region buffer").ThrowAsJavaScriptException();
        return env.Null();
    }

    const long start_time = xdb_now();
    err = xdb_search_by_string(&searcher, ip_string.c_str(), &region);
    const long elapsed_time = xdb_now() - start_time;

    if (err != 0) {
        xdb_region_buffer_free(&region);
        Napi::Error::New(env, "IP address lookup failed").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Object result = Napi::Object::New(env);
    result.Set("region", Napi::String::New(env, region.value ? region.value : ""));
    result.Set("ioCount", Napi::Number::New(env, xdb_get_io_count(&searcher)));
    result.Set("took", Napi::Number::New(env, elapsed_time));

    xdb_region_buffer_free(&region);
    return result;
}

Napi::Value Ip2RegionSearcher::Close(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (is_initialized) {
        xdb_close(&searcher);
        if (v_index) {
            xdb_free_vector_index(v_index);
            v_index = nullptr;
        }
        if (c_buffer) {
            xdb_free_content(c_buffer);
            c_buffer = nullptr;
        }
        xdb_clean_winsock();
        is_initialized = false;
    }
    
    return env.Undefined();
}

Napi::Value VerifyXdb(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected database path as string").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    const std::string db_path = info[0].As<Napi::String>().Utf8Value();
    
    int error_code = xdb_verify_from_file(db_path.c_str());
    
    Napi::Object result = Napi::Object::New(env);
    result.Set("valid", Napi::Boolean::New(env, error_code == 0));
    result.Set("errorCode", Napi::Number::New(env, error_code));
    
    return result;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    Ip2RegionSearcher::Init(env, exports);
    exports.Set("verifyXdb", Napi::Function::New(env, VerifyXdb));
    return exports;
}

NODE_API_MODULE(ip2region, Init)