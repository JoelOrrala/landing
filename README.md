# Building GDAL with PDFium for Android

This guide explains how to build GDAL with PDFium integration into an Android Archive (AAR) file. The process involves setting up [GDAL4Android](https://github.com/kikitte/GDAL4Android) and modifying it to include PDFium support.

## Overview

The build process consists of two main steps:

1. **Build PDFium for Android** - Using the build system in [`drivers/pdfium`](drivers/pdfium/README.md) to generate `libpdfium.a` and headers
2. **Build GDAL AAR with PDFium** - Modify GDAL4Android to include PDFium and build the final AAR file

## Prerequisites

- Linux build environment (tested on Ubuntu/Debian)
- Android NDK (r25c or newer, r26b recommended)
- Java Development Kit (JDK) - Android Studio default JDK
- Docker (optional, for containerized builds)
- Git
- CMake
- Make and other build tools

## Step 1: Build PDFium for Android

First, you need to build PDFium using the build system provided in this repository. See the detailed instructions in [`drivers/pdfium/README.md`](drivers/pdfium/README.md).

After a successful build, you should have:
- `libpdfium.a` - The static PDFium library
- PDFium headers in `install_android/include/pdfium/`

Copy these files to a location accessible for the GDAL4Android build process.

## Step 2: Set Up GDAL4Android

### Clone GDAL4Android

```bash
cd <your-workspace-path>
git clone https://github.com/kikitte/GDAL4Android.git
cd GDAL4Android
```

### Initial Setup (Without PDFium)

Follow the original GDAL4Android setup instructions. You can build with Docker (recommended) or on your local machine.

#### Option A: Build with Docker (Recommended)

**Important:** This project requires Android NDK r26 for PDFium compatibility. Before building the Docker image, you must replace the GDAL4Android Dockerfile with the custom one provided in this repository.

**Replace the Dockerfile:**

```bash
# Copy the custom Dockerfile (uses NDK 26) from this repository
cp android/Dockerfile GDAL4Android/docker/Dockerfile
```

The custom Dockerfile installs Android NDK r26.1.10909125, which is required for building PDFium with GDAL.

For 4KB page size apps (default):

```bash
# Build the Docker image (now using NDK 26)
docker build -t gdal4android_builder_img - < docker/Dockerfile

# Run the container
docker run -it --name gdal4android_builder -v .:/root/GDAL4Android gdal4android_builder_img

# Inside the container:
cp /root/GDAL4Android/docker/cmake_modules/FindJNI.cmake /usr/share/cmake-3.22/Modules/FindJNI.cmake
cd /root/GDAL4Android

# Clean and build
./gradlew gdal:clean
./gradlew gdal:assembleRelease
```

For 16KB page size apps:

```bash
# Build the Docker image
docker build -t gdal4android_builder_img_16kb - < docker/Dockerfile_16kb

# Run the container
docker run -it --name gdal4android_builder_16kb -v .:/root/GDAL4Android gdal4android_builder_img_16kb

# Inside the container:
cp /root/GDAL4Android/docker/cmake_modules/FindJNI.cmake /usr/share/cmake-3.22/Modules/FindJNI.cmake
cd /root/GDAL4Android
echo "ndk.dir=/root/android_sdk/ndk/28.1.13356709" > local.properties

# Clean and build
./gradlew gdal:clean
./gradlew gdal:assembleRelease
```

#### Option B: Build on Local Machine

Requirements:
- Linux
- Android Studio 2022.2 or newer with NDK r25c or newer
- Build tools: getconf, make, cmake, libtool, ant, swig

```bash
cd <GDAL4Android root directory>

# Clean project first
./gradlew gdal:clean

# Build GDAL AAR
./gradlew gdal:assembleRelease
```

The output AAR file will be in: `GDAL4Android/gdal/build/outputs/aar/gdal-release.aar`

## Step 3: Modify GDAL4Android for PDFium Integration

To integrate PDFium into GDAL4Android, you need to:

1. Add PDFium library and headers
2. Add PDFium's dependency libraries (JPEG, LCMS2, PNG, ZLIB)
3. Modify the build script to include PDFium in the CMake configuration

### 3.1 Add PDFium Library and Headers

Copy the PDFium library and headers from your PDFium build to the GDAL4Android project:

```bash
# From your PDFium build output (install_android/)
cp install_android/lib/libpdfium.a GDAL4Android/gdal/cpp/lib/
cp -r install_android/include/pdfium GDAL4Android/gdal/cpp/include/
```

### 3.2 Add PDFium Dependency Libraries

PDFium depends on several libraries that need to be available for GDAL's build process. You need to add these libraries and their headers:

**Required libraries:**
- `libjpeg.a` - JPEG library
- `liblcms2.a` - Little CMS 2 (color management)
- `libpng.a` - PNG library
- `libz.a` - Zlib compression library

**Directory structure:**
```
GDAL4Android/gdal/cpp/
├── lib/
│   ├── libpdfium.a
│   ├── libjpeg.a
│   ├── liblcms2.a
│   ├── libpng.a
│   └── libz.a
└── include/
    ├── pdfium/
    ├── jpeg/
    ├── lcms2/
    ├── png/
    └── zlib/
```

#### Pre-compiled Libraries Available

**Pre-compiled libraries and headers are available in this repository** in the [`bin/android`](../bin/android) folder. These have been compiled for Android `arm64-v8a` ABI with compatible settings for PDFium integration.

To use the pre-compiled libraries:

```bash
# Copy libraries
cp -r bin/android/lib/*.a GDAL4Android/gdal/cpp/lib/

# Copy header directories
cp -r bin/android/include/* GDAL4Android/gdal/cpp/include/
```

**Note:** The pre-compiled libraries in `bin/` are built for `arm64-v8a` architecture. If you need other ABIs, you'll need to build them separately.

#### Building Libraries Yourself

If you prefer to build these libraries yourself, they can be:
- Built separately for Android using the NDK
- Extracted from PDFium's build dependencies
- Obtained from other pre-built Android library sources

**Important:** Ensure all libraries are built for the same Android ABI (e.g., `arm64-v8a`) and with compatible compiler settings (RTTI, exceptions, etc.) as PDFium.

### 3.3 Modify build-gdal-android.sh

The `build-gdal-android.sh` script needs several modifications to support PDFium integration. The main changes are in the `build_gdal()` function's CMake configuration.

#### Required Modifications

**1. Enable PDF driver and PDFium support:**
```bash
-DGDAL_ENABLE_DRIVER_PDF=ON \
-DGDAL_USE_PDFIUM=ON \
```

**2. Add PDFium library and header paths:**
```bash
-DPDFIUM_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/pdfium" \
-DPDFIUM_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/libpdfium.a" \
```

**3. Add PDFium dependency libraries (JPEG, LCMS2, PNG, ZLIB):**
```bash
-DLCMS2_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/liblcms2.a" \
-DLCMS2_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/lcms2" \
-DJPEG_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/jpeg" \
-DJPEG_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/libjpeg.a" \
-DZLIB_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/zlib" \
-DZLIB_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/libz.a" \
-DGDAL_USE_PNG=ON \
-DPNG_PNG_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/png" \
-DPNG_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/libpng.a" \
```

**4. Enable iconv support (required for PDFium):**
```bash
-DGDAL_USE_ICONV=ON \
```

**5. Add compiler and linker flags:**
```bash
-DCLANG_ENABLE_OPAQUE_POINTERS=OFF \
-DCMAKE_SHARED_LINKER_FLAGS="-lc++_static -lc++abi" \
```

**6. Fix typo in EXPAT build directory (bug fix):**

In the `build_for_target()` function, there's a bug where EXPAT uses the SQLITE build directory. Change:
```bash
local EXPAT_BUILD_DIR=$BUILD_DIR/sqlite
```
to:
```bash
local EXPAT_BUILD_DIR=$BUILD_DIR/expat
```

**Important:** 
- Adjust the paths (`/root/GDAL4Android/`) according to your actual build environment:
  - In Docker: `/root/GDAL4Android/`
  - On local machine: Use the absolute path to your GDAL4Android directory
- Note: There's a typo in some versions: `-D-DZLIB_INCLUDE_DIR` should be `-DZLIB_INCLUDE_DIR` (single dash)

#### Complete Modified build_gdal() Function

The complete CMake configuration in `build_gdal()` should include all the above flags. Here's the relevant section:

```bash
cmake -S . -B $BUILD_DIR \
   -DCMAKE_INSTALL_PREFIX=$INSTALL_DIR \
   -DCMAKE_SYSTEM_NAME=Android \
   -DCMAKE_ANDROID_NDK=$ANDROID_NDK \
   -DCMAKE_ANDROID_ARCH_ABI=$ABI \
   -DCMAKE_SYSTEM_VERSION=$API \
   "-DCMAKE_PREFIX_PATH=$INSTALL_DIR;$TOOLCHAIN/sysroot/usr/" \
   -DCMAKE_FIND_ROOT_PATH_MODE_INCLUDE=NEVER \
   -DCMAKE_FIND_ROOT_PATH_MODE_LIBRARY=NEVER \
   -DCMAKE_FIND_USE_CMAKE_SYSTEM_PATH=NO \
   -DSFCGAL_CONFIG=disabled \
   -DHDF5_C_COMPILER_EXECUTABLE=disabled \
   -DHDF5_CXX_COMPILER_EXECUTABLE=disabled \
   -DGDAL_BUILD_OPTIONAL_DRIVERS=OFF \
   -DOGR_BUILD_OPTIONAL_DRIVERS=OFF \
   -DGDAL_USE_EXTERNAL_LIBS=OFF \
   -DGDAL_USE_SQLITE3=ON \
   -DGDAL_USE_EXPAT=ON \
   -DGDAL_BUILD_JAVA_BINDINGS=ON \
   -DGDAL_USE_JAVA=ON \
   -DBUILD_JAVA_BINDINGS=ON \
   -DBUILD_PYTHON_BINDINGS=OFF \
   -DBUILD_CSHARP_BINDINGS=OFF \
   -DGDAL_ENABLE_DRIVER_PDF=ON \
   -DGDAL_USE_ICONV=ON \
   -DGDAL_USE_PDFIUM=ON \
   -DPDFIUM_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/pdfium" \
   -DPDFIUM_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/libpdfium.a" \
   -DLCMS2_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/liblcms2.a" \
   -DLCMS2_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/lcms2" \
   -DJPEG_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/jpeg" \
   -DJPEG_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/libjpeg.a" \
   -DZLIB_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/zlib" \
   -DZLIB_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/libz.a" \
   -DGDAL_USE_PNG=ON \
   -DPNG_PNG_INCLUDE_DIR="/root/GDAL4Android/gdal/cpp/include/png" \
   -DPNG_LIBRARY="/root/GDAL4Android/gdal/cpp/lib/libpng.a" \
   -DJAVA_HOME=$JAVA_HOME \
   -DJNI_SUPPORT=ON \
   -DJAVA_INCLUDE_PATH=$JAVA_HOME/include \
   -DJAVA_INCLUDE_PATH2=$JAVA_HOME/include/linux \
   -DJAVA_AWT_INCLUDE_PATH=$JAVA_HOME/include \
   -DJAVA_AWT_LIBRARY=$JAVA_HOME/lib \
   -DJAVA_JVM_LIBRARY=$JAVA_HOME/lib/server/libjvm.so \
   -DCLANG_ENABLE_OPAQUE_POINTERS=OFF \
   -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
   -DCMAKE_SHARED_LINKER_FLAGS="-lc++_static -lc++abi"
```

#### Option: Replace Entire Script

Instead of manually editing `build-gdal-android.sh`, you can replace it with the pre-modified version committed in this repository:

```bash
# Copy the modified build-gdal-android.sh from this repository
cp android/build-gdal-android.sh GDAL4Android/gdal/build_cpp.sh
chmod +x GDAL4Android/gdal/build_cpp.sh
```

**Note:** Remember to adjust the paths in the script (`/root/GDAL4Android/`) to match your actual build environment:
- In Docker: `/root/GDAL4Android/`
- On local machine: Use the absolute path to your GDAL4Android directory

### 3.4 Modify PDF Driver CMakeLists.txt

The PDF driver's CMakeLists.txt needs to be modified to properly configure PDFium support. The file is located at:

```
GDAL4Android/gdal/cpp/gdal-3.7.0/frmts/pdf/CMakeLists.txt
```

**Replace the `if (GDAL_USE_PDFIUM)` section** with the following configuration:

```cmake
if (GDAL_USE_PDFIUM)
    # --- Import PDFium ---
    add_library(PDFIUM::PDFIUM SHARED IMPORTED)
    set_target_properties(PDFIUM::PDFIUM PROPERTIES
        IMPORTED_LOCATION "/root/GDAL4Android/gdal/cpp/lib/libpdfium.so"
        INTERFACE_INCLUDE_DIRECTORIES "/root/GDAL4Android/gdal/cpp/include/pdfium"
    )

    # --- Definiciones de compilación ---
    target_compile_features(gdal_PDF PRIVATE cxx_std_17)
    target_compile_definitions(gdal_PDF PRIVATE HAVE_PDFIUM)

    # --- Forzar variables internas para que GDAL detecte PDFium ---
    set(PDFIUM_FOUND TRUE CACHE INTERNAL "PDFium found") 
    set(HAVE_PDFIUM TRUE CACHE INTERNAL "HAVE PDFium")

    # --- Linking ---
    gdal_target_link_libraries(gdal_PDF PRIVATE PDFIUM::PDFIUM)

    if (UNIX)
        find_library(LCMS2_LIBRARY NAMES lcms2)
        # Asegurarse de que ninguna variable esté vacía
        if(NOT LCMS2_LIBRARY)
            set(LCMS2_LIBRARY "")
        endif()
        gdal_target_link_libraries(
            gdal_PDF
            PRIVATE
            PDFIUM::PDFIUM
            JPEG::JPEG
            PNG::PNG
            ${OPENJPEG_LIBRARIES}
            Threads::Threads
            ${LCMS2_LIBRARY}
        )
    endif()
endif()
```

**Important notes:**
- Adjust the paths (`/root/GDAL4Android/`) to match your build environment
- The `IMPORTED_LOCATION` should point to `libpdfium.so` (shared library) or `libpdfium.a` (static library) depending on your build
- If using static library, change `SHARED IMPORTED` to `STATIC IMPORTED` and update the path to `libpdfium.a`
- The configuration forces PDFium detection variables and links all required dependencies (JPEG, PNG, LCMS2, etc.)

### 3.4 Build GDAL with PDFium

After making the modifications:

```bash
cd GDAL4Android

# Clean previous build
./gradlew gdal:clean

# Build GDAL AAR with PDFium
./gradlew gdal:assembleRelease
```

The output AAR file with PDFium support will be in:
`GDAL4Android/gdal/build/outputs/aar/gdal-release.aar`

## Output

After a successful build, you'll have:
- `gdal-release.aar` - GDAL Android Archive with PDFium integration
- The AAR includes all native libraries (`.so` files) for the target ABIs

## Test Application

You can test the generated GDAL AAR (with PDFium support) using the following demo application:

👉 https://github.com/syntaxdevs/gdal-android-demo

> Note: Make sure to replace the `.aar` in the demo project with your locally generated version if you want to test custom builds.

## Pre-built Binaries

Previously generated library files can be found in the [`bin/android`](../bin/android) folder of this repository:
- `libpdfium.a` - The compiled PDFium static library
- `gdal-release.aar` - Pre-built GDAL AAR with PDFium integration

## Troubleshooting

### Library Path Issues

If CMake cannot find the libraries, verify:
- All library files (`.a`) are in `gdal/cpp/lib/`
- All header directories are in `gdal/cpp/include/`
- Paths in `build-gdal-android.sh` match your actual directory structure

### ABI Compatibility

Ensure all libraries are built for the same Android ABI and with compatible compiler flags:
- Same NDK version
- RTTI enabled (`-frtti`)
- Exceptions enabled (`-fexceptions`)
- Same C++ standard library (libc++)

### Build Errors

If you encounter build errors:
1. Check that PDFium was built with the same NDK version
2. Verify all dependency libraries are present
3. Ensure CMake flags are correctly set in `build-gdal-android.sh`
4. Check that paths use absolute paths or are relative to the build context

## References

- [GDAL4Android](https://github.com/kikitte/GDAL4Android) - Original GDAL4Android project
- [PDFium Android Build](drivers/pdfium/README.md) - PDFium build instructions
- [GDAL Documentation](https://gdal.org/) - GDAL official documentation

