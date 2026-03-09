# PDFium iOS Build for GDAL Integration

This repository provides a **reproducible build system for PDFium on iOS**, configured for integration with **GDAL**.

The build process downloads PDFium, applies required patches, compiles the library for all required iOS architectures, and generates a final **XCFramework** ready to use in Xcode projects or GDAL-based applications.

---

# Overview

The build system automatically:

- Downloads and configures **depot_tools**
- Fetches **PDFium source code**
- Applies required **iOS build patches**
- Builds PDFium for:

  - iOS devices (`arm64`)
  - iOS simulator (`arm64`)
  - iOS simulator (`x86_64`)

- Creates a **universal simulator library**
- Generates the final **PDFium.xcframework**

---

# Prerequisites

The build must be executed on **macOS**.

Required tools:

- macOS
- Xcode + Command Line Tools
- Git
- Python 3
- ~10GB free disk space

Verify Xcode tools are installed:

```
xcode-select -p
```

If needed:

```
xcode-select --install
```

---

# Quick Start

1️⃣ Clone or download this repository.

2️⃣ Make the scripts executable:

```
chmod +x build_pdfium_ios.sh
chmod +x patches/apply_ios_patches.sh
```

3️⃣ Run the build:

```
./build_pdfium_ios.sh
```

The script will automatically:

- Download **depot_tools**
- Download **PDFium**
- Apply required patches
- Build all architectures
- Create **PDFium.xcframework**

---

# Build Output

After a successful build, the following artifacts will be generated:

```
pdfium/out/

ios-arm64/obj/libpdfium.a
ios-sim-arm64/obj/libpdfium.a
ios-sim-x86_64/obj/libpdfium.a
universal-sim/libpdfium.a
PDFium.xcframework
```

Description:

| Artifact | Description |
|--------|-------------|
| ios-arm64 | Library for real iOS devices |
| ios-sim-arm64 | Library for Apple Silicon simulator |
| ios-sim-x86_64 | Library for Intel simulator |
| universal-sim | Combined simulator library |
| PDFium.xcframework | Final framework usable in Xcode |

---

# Build Architecture

The build produces the following architectures.

Device:

```
arm64
```

Simulator:

```
arm64
x86_64
```

Simulator libraries are merged using:

```
lipo
```

The final framework is created with:

```
xcodebuild -create-xcframework
```

---

# Configuration

Build parameters are defined in:

```
args_ios_device_arm64.gn
args_ios_sim_arm64.gn
args_ios_sim_x64.gn
```

Important configuration flags:

```
pdf_is_standalone = true
pdf_is_complete_lib = true

pdf_enable_v8 = false
pdf_enable_xfa = false
pdf_use_skia = false

pdf_use_partition_alloc = false
use_partition_alloc_as_malloc = false

use_rtti = true
enable_exceptions = true
use_custom_libcxx = false
```

These settings ensure **compatibility with GDAL builds**.

---

# Patches Applied

The script `patches/apply_ios_patches.sh` applies several required fixes for iOS builds:

- Disables PDFium test targets that break cross-compilation
- Fixes `libjpeg_turbo` dependency issues on iOS
- Fixes duplicate Skia source compilation
- Adjusts build configuration for iOS toolchains

---

# Repository Structure

```text
pdfium_ios_build/
├── build_pdfium_ios.sh
├── args_ios_device_arm64.gn
├── args_ios_sim_arm64.gn
├── args_ios_sim_x64.gn
├── patches/
│   └── apply_ios_patches.sh
├── pdfium/        (downloaded automatically)
├── depot_tools/   (downloaded automatically)
└── full_build.log
```
---

# Troubleshooting

### Clean build

If the build fails:

```
rm -rf pdfium
./build_pdfium_ios.sh
```

---

### Verify simulator library

```
lipo -info pdfium/out/universal-sim/libpdfium.a
```

Expected output:

```
Architectures in the fat file: x86_64 arm64
```

---

# References

PDFium  
https://pdfium.googlesource.com/pdfium

Apple XCFramework Documentation  
https://developer.apple.com/documentation/xcode/creating-a-multi-platform-binary-framework-bundle

GDAL  
https://gdal.org
