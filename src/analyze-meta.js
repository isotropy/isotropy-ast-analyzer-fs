import path from "path";

export default function(analysisState) {
  return {
    analyzeImportDeclaration(babelPath, state) {
      // Incorrect config
      if (!state.opts.projects) return false;

      let absolutePath = null;

      const fsProject = state.opts.projects.find(project => {
        const projectDir = project.dir.startsWith("./")
          ? project.dir
          : "./" + project.dir;
        absolutePath = path.resolve(projectDir) + "/";
        return state.file.opts.filename.startsWith(absolutePath);
      });

      // Not a fs project
      if (!fsProject) return false;

      const moduleName = babelPath.get("source").node.value;
      const resolvedName = path.resolve(
        path.dirname(state.file.opts.filename),
        moduleName
      );

      fsProject.absolutePath = absolutePath;

      const fsModule = fsProject.modules.find(
        m => fsProject.absolutePath + m.source === resolvedName
      );

      if (!fsModule) return false;

      const specifier = babelPath.get("specifiers.0").node.local.name;
      analysisState.importBindings = analysisState.importBindings.concat({
        module: fsModule.locations,
        binding: babelPath.scope.bindings[specifier]
      });
      return true;
    }
  };
}
