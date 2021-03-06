import PkgInfo from "../pkg-info.js"

import builtinModules from "../builtin-modules.js"
import { dirname } from "path"
import moduleLoad from "../module/esm/load.js"
import resolveFilename from "../module/esm/resolve-filename.js"

function hook(Module) {
  const { _tickCallback, argv } = process
  const [, mainPath] = argv
  const { runMain } = Module

  const useTickCallback = typeof _tickCallback === "function"

  Module.runMain = () => {
    Module.runMain = runMain

    if (mainPath in builtinModules) {
      Module.runMain()
      return
    }

    const filePath = resolveFilename(mainPath, null, true)
    const pkgInfo = PkgInfo.get(dirname(filePath))

    if (pkgInfo === null) {
      Module.runMain()
      return
    }

    moduleLoad(filePath, null, true, pkgInfo.options)
    tryTickCallback()
  }

  function tryTickCallback() {
    if (useTickCallback) {
      _tickCallback()
    }
  }
}

export default hook
