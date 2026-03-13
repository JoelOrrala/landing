# PDFium iOS Build for GDAL Integration

This repository provides a **reproducible build system for PDFium on iOS**, configured for integration with **GDAL**.

The build process downloads PDFium, applies required patches, compiles the library for all required iOS architectures, and generates a final **XCFramework** ready to use in Xcode projects or GDAL-based applications.

---

# Overview

The build system automatically:

- Downloads and configures **depot_tools**
- Fetches the PDFium source code (revision chromium/5461)
- Applies required **iOS and GDAL compatibility patches**
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
├── ios-arm64/obj/libpdfium.a
├── ios-sim-arm64/obj/libpdfium.a
├── ios-sim-x86_64/obj/libpdfium.a
├── universal-sim/libpdfium.a
└── PDFium.xcframework
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
args_ios_sim_x86_64.gn
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

# Pinned Versions

This build system currently uses the following pinned versions:

- **PDFium revision:** `chromium/5461`
- **depot_tools commit:** `25334bb18e549fef8c1516ac270e9bbfa3fd655b`

Pinning these versions ensures reproducible builds and prevents unexpected breakages caused by upstream changes.

---

# Patches Applied

The script `patches/apply_ios_patches.sh` applies several required fixes to allow PDFium to compile correctly on iOS and remain compatible with GDAL.

### iOS build patches

These patches adjust the PDFium build system to work properly with iOS toolchains:

- Disable `pdfium_unittests`
- Disable `pdfium_embeddertests`
- Simplify `pdfium_all` target
- Disable a `libjpeg_turbo` assertion that prevents iOS builds
- Prevent duplicate compilation of `SkCreateCGImageRef.cpp`

These changes allow PDFium to compile cleanly for iOS device and simulator architectures.

---

### GDAL compatibility patch (PDFium 5461)

GDAL 3.7 expects several API signatures that differ slightly from upstream PDFium.  
A compatibility patch is applied to align PDFium with GDAL's expectations.

This patch modifies the following components:

- Introduces `CPDF_OCContextInterface`
- Adjusts the inheritance of `CPDF_OCContext`
- Updates several rendering method signatures to use:

```
const pdfium::span<const TextCharPos>&
```

instead of

```
pdfium::span<const TextCharPos>
```

Affected files include:

```
core/fpdfapi/page/cpdf_occontext.cpp
core/fpdfapi/page/cpdf_occontext.h
core/fpdfapi/render/cpdf_renderoptions.h
core/fxge/agg/fx_agg_driver.*
core/fxge/cfx_renderdevice.*
core/fxge/renderdevicedriver_iface.*
core/fxge/win32/cgdi_printer_driver.cpp
core/fxge/win32/cps_printer_driver.cpp
core/fxge/win32/ctext_only_printer_driver.cpp
```

These changes ensure compatibility with the GDAL PDF driver implementation.

---

### Chromium style fix

Recent Chromium toolchains require destructors overriding a virtual base class to explicitly declare `override`.

The following change is applied:

```
~CPDF_OCContextInterface() override = default;
```

This prevents the following compiler error during the PDFium build:

```
[chromium-style] Overriding method must be marked with 'override' or 'final'
```

Without this modification, the build fails during compilation of the PDFium core modules.

---

All patches are applied automatically by:

```
patches/apply_ios_patches.sh
```

during the build process.

---

# GDAL Compatibility

This build is specifically configured for integration with **GDAL 3.7**.

Key compatibility aspects:

- PDFium built as a **static library**
- Exceptions and RTTI enabled
- V8 and XFA disabled
- Skia disabled
- Compatible span signatures used by GDAL PDF driver
- Abseil headers exposed for GDAL compilation

The resulting library is intended to be used by GDAL's **PDF driver with PDFium backend**.

---

# Repository Structure

```text
pdfium_ios_build/
├── build_pdfium_ios.sh
├── args_ios_device_arm64.gn
├── args_ios_sim_arm64.gn
├── args_ios_sim_x86_64.gn
├── patches/
│   └── apply_ios_patches.sh
├── pdfium/        (downloaded automatically)
├── depot_tools/   (downloaded automatically)
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

- PDFium  
  https://pdfium.googlesource.com/pdfium

- Build scripts for PDFium for use with GDAL 3.7 
  https://github.com/rouault/pdfium_build_gdal_3_7

- Apple XCFramework Documentation  
  https://developer.apple.com/documentation/xcode/creating-a-multi-platform-binary-framework-bundle

- GDAL  
  https://gdal.org/
