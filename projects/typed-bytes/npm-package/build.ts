import shell from "https://raw.githubusercontent.com/voltrevo/monorepo/038266d/projects/shell/mod.ts";

// Make current directory the same as this script
Deno.chdir(new URL(".", import.meta.url).pathname);

// Cleanup
await shell.run("rm", "-rf", "typed-bytes", "typed-bytes.tgz");

// Copy files into typed-bytes
await shell.run("mkdir", "typed-bytes");
await shell.run(
  "cp",
  "-a",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "../README.md",
  "../src",
  "typed-bytes/.",
);

// Build inside typed-bytes
Deno.chdir("typed-bytes");
await shell.run("npm", "install");

{ // Need to replace README.md relative links with absolute links
  const projectPath = [
    "https://github.com/voltrevo/monorepo/tree/",
    await shell.Line("git", "rev-parse", "HEAD"),
    "/projects/typed-bytes",
  ].join("");

  const contentLines = new TextDecoder()
    .decode(await Deno.readFile("README.md"))
    .split("\n");

  const newLines: string[] = [];

  for (const line of contentLines) {
    newLines.push(line.replace(/(\[[^\]]*\])\(.\//, `$1(${projectPath}/`));
  }

  await Deno.writeFile(
    "README.md",
    new TextEncoder().encode(newLines.join("\n")),
  );
}

{ // Need to replace `import "<path>/file.ts";` with `import "<path>/file";`
  const files = await shell.Lines("find", "src", "-type", "f");

  for (const file of files) {
    if (!/\.ts$/.test(file)) {
      continue;
    }

    const contentLines = new TextDecoder()
      .decode(await Deno.readFile(file))
      .split("\n");

    const newLines: string[] = [];

    for (const line of contentLines) {
      newLines.push(line.replace(/\.ts";$/, '";'));
    }

    await Deno.writeFile(file, new TextEncoder().encode(newLines.join("\n")));
  }
}

await shell.run("npm", "run", "build");
await shell.run("rm", "-rf", "node_modules");
Deno.chdir("..");

await shell.run("tar", "-czf", "typed-bytes.tgz", "typed-bytes");
await shell.run("rm", "-rf", "typed-bytes");

console.log("Successfully created typed-bytes.tgz");
