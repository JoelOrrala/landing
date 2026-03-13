# GDAL for iOS

Independent project to build GDAL as an `.xcframework` for iOS.

The build automatically downloads **GDAL** and **PROJ**, and allows integrating **PDFium** as the backend for GDAL's PDF driver.

## Result

Generates `install-ios/GDAL.xcframework` ready to use in Xcode, with support for:

- **iOS arm64** (physical devices)
- **iOS Simulator arm64** (Apple Silicon)
- **iOS Simulator x86_64** (Intel)

The build includes support for the **GDAL PDF driver using PDFium**.

System libraries required by Apple platforms must still be linked in Xcode.

## Requirements

- macOS with Xcode installed
- CMake 3.9+
- Git

## PDFium Integration

This build supports the **GDAL PDF driver using PDFium** as the rendering engine.

PDFium must be built beforehand using the project:

```
pdfium_ios_build
```

The GDAL build expects to find PDFium in:

```
ios/pdfium_ios_build/
```

Expected structure:

```
pdfium_ios_build/
└── pdfium/
    └── out/
        ├── ios-arm64/
        │   └── obj/
        │       └── libpdfium.a
        ├── ios-sim-arm64/
        │   └── obj/
        │       └── libpdfium.a
        ├── ios-sim-x86_64/
        │   └── obj/
        │       └── libpdfium.a
        ├── universal-sim/
        │   └── libpdfium.a
        └── PDFium.xcframework
```

During compilation, the script `build-gdal-ios.sh` automatically detects the appropriate library for each architecture.

## GDAL Patch for PDFium

To allow integration with PDFium on iOS, a modification is applied to the file:

```
frmts/pdf/CMakeLists.txt
```

This change:

- Registers `PDFIUM::PDFIUM` as an imported static library
- Exposes PDFium headers to GDAL
- Includes **Abseil** headers required by PDFium
- Adjusts linking dependencies for iOS

The patch is applied automatically through:

```
patches/apply_gdal_ios_patches.sh
```

during the execution of `build-all.sh`.

## Quick Start

```bash
cd ios
chmod +x build-all.sh build-proj-ios.sh build-gdal-ios.sh build-ios-deps.sh patches/apply_gdal_ios_patches.sh
./build-all.sh
```

The script will download PROJ and GDAL, build them, and create the `.xcframework`. This process may take 15–30 minutes.

## Advanced use

### Use local sources

If you already have GDAL and PROJ downloaded:

```bash
# Only PROJ
PROJ_SOURCE_DIR=/path/to/proj ./build-proj-ios.sh

# Only GDAL (after PROJ is compiled)
GDAL_SOURCE_DIR=/path/to/gdal PROJ_DIR=./install-proj-ios ./build-gdal-ios.sh
```

### Change versions

```bash
PROJ_VERSION=9.5 GDAL_BRANCH=v3.7.0 ./build-all.sh
```

### Source location

By default sources are downloaded to `sources/`. You can change it:

```bash
SOURCES_DIR=/another/path ./build-all.sh
```

## Project Structure

```
ios/
├── build-all.sh                  # Main script – runs the full build pipeline
├── build-gdal-ios.sh             # Builds GDAL and generates the xcframework
├── build-proj-ios.sh             # Builds PROJ for iOS
├── build-ios-deps.sh             # Builds third-party dependencies (expat, jpeg, tiff, png, zlib)
│
├── patches/
│ ├── apply_gdal_ios_patches.sh   # Applies the PDFium integration patch to GDAL
│ └── CMakeLists_pdfium_ios.txt   # Replacement CMake configuration for the GDAL PDF driver
│
├── deps/                         # Source, build, and install directories for dependencies
├── sources/                      # Downloaded GDAL and PROJ sources
│
├── build-ios/                    # Temporary GDAL build directory
├── build-proj-ios/               # Temporary PROJ build directory
│
├── install-ios/
│ └── GDAL.xcframework            # Final output framework
│
├── install-proj-ios/             # Installed PROJ builds
│
├── pdfium_ios_build/             # Prebuilt PDFium project required for GDAL PDF support

```

## Use in Xcode

1. Drag `GDAL.xcframework` into your project
2. In "Frameworks, Libraries, and Embedded Content": select **Embed & Sign**
3. In Build Settings > Header Search Paths: `$(SRCROOT)/path/to/GDAL.xcframework/ios-arm64/GDAL.framework/Headers` (recursive)
4. If using Swift: create a Bridging Header with `#import "gdal.h"`

## Additional System Libraries

The generated `GDAL.xcframework` statically includes GDAL, PROJ, PDFium, and the third-party libraries built in this project (expat, jpeg, tiff, png, zlib).

However, some **Apple system libraries are not bundled** and must be linked manually in Xcode.

### Required system libraries

Add the following libraries in:

```
Target → Build Phases → Link Binary With Libraries
```

Required:

- `libiconv.tbd`
- `libsqlite3.tbd`

### Linker flags

Because GDAL and its dependencies are merged into a static archive inside the framework, it may be necessary to force the linker to load the symbols.

In:

```
Target → Build Settings → Other Linker Flags
```

Add:

```
-lc++
-force_load $(PROJECT_DIR)/GDAL.xcframework/ios-arm64_x86_64-simulator/GDAL.framework/GDAL
```

The exact path may vary depending on where the `GDAL.xcframework` is located in your project.

## Notes

This project **does not build PDFium automatically**.

PDFium must be built beforehand using the project:

```
pdfium_ios_build
```

The resulting build must be placed inside the `ios/` directory so GDAL can link against `libpdfium.a`.

## License

GDAL is licensed under MIT/X License. PROJ under MIT. See the original projects for more details.

## Independent repository

You can upload this project to your own repository. It contains only scripts and does not include GDAL/PROJ source code. Sources are downloaded at build time from GitHub (OSGeo/PROJ, OSGeo/gdal).
