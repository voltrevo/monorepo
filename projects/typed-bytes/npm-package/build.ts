import shell from "https://raw.githubusercontent.com/voltrevo/monorepo/038266d/projects/shell/mod.ts";

// Make current directory the same as this script
Deno.chdir(new URL(".", import.meta.url).pathname);

// Cleanup
await shell.run("rm", "-rf", "typed-bytes");

// Copy files into typed-bytes
await shell.run("mkdir", "typed-bytes");
await shell.run(
  "cp",
  "-a",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "../src",
  "typed-bytes/.",
);

// Build inside typed-bytes
Deno.chdir("typed-bytes");
await shell.run("npm", "install");

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

await shell.run("npm", "run", "build");
await shell.run("rm", "-rf", "node_modules");
Deno.chdir("..");
