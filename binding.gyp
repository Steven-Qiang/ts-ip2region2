{
  "targets": [
    {
      "target_name": "ip2region",
      "sources": [
        "addon.cpp",
        "ip2region/xdb_util.c",
        "ip2region/xdb_searcher.c"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        ".",
        "ip2region"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS"
      ],
      "conditions": [
        ["OS=='win'", {
          "libraries": [
            "ws2_32.lib"
          ]
        }]
      ]
    }
  ]
}