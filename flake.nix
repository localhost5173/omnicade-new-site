{
  description = "omnicade.dev — marketing site (SvelteKit 5 + TypeScript)";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs = {
    self,
    nixpkgs,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    lib = pkgs.lib;

    # the flake source, minus things that must never enter a nix build
    src = lib.cleanSourceWith {
      src = lib.cleanSource self;
      filter = path: type:
        type != "directory"
        || !builtins.elem (baseNameOf path) [
          "node_modules"
          ".svelte-kit"
          "build"
          ".direnv"
        ];
    };
  in rec {
    packages.${system}.default = pkgs.stdenv.mkDerivation (finalAttrs: {
      pname = "omnicade-site";
      version = "1.1.0";

      inherit src;

      nativeBuildInputs = [
        pkgs.nodejs
        pkgs.pnpm
        pkgs.pnpmConfigHook
      ];

      pnpmDeps = pkgs.fetchPnpmDeps {
        inherit (finalAttrs) pname version src;
        fetcherVersion = 4;
        hash = "sha256-XM/NzFz5RGbgzd8bubovwKRvYdriYJyaPv9JuujYu+o=";
      };

      buildPhase = ''
        runHook preBuild
        pnpm run build
        runHook postBuild
      '';

      installPhase = ''
        runHook preInstall
        mkdir -p $out/share
        cp -r build $out/share/omnicade-site
        runHook postInstall
      '';
    });

    # `nix run .#` — build the site and serve it on localhost
    apps.${system} = {
      default = {
        type = "app";
        program = lib.getExe (pkgs.writeShellApplication {
          name = "omnicade-site-serve";
          text = ''
            echo "omnicade-site → http://localhost:8123  (Ctrl-C to stop)"
            exec ${pkgs.python3}/bin/python3 -m http.server 8123 \
              -d ${packages.${system}.default}/share/omnicade-site
          '';
        });
      };

      # `nix run .#dev` — vite dev server against the working tree
      # (needs `nix develop -c pnpm install` once, for node_modules)
      dev = {
        type = "app";
        program = lib.getExe (pkgs.writeShellApplication {
          name = "omnicade-site-dev";
          runtimeInputs = [
            pkgs.nodejs
            pkgs.pnpm
          ];
          text = ''
            if [ ! -d node_modules ]; then
              echo "no node_modules here — run: nix develop -c pnpm install" >&2
              exit 1
            fi
            exec ${pkgs.pnpm}/bin/pnpm run dev
          '';
        });
      };
    };

    devShells.${system}.default = pkgs.mkShell {
      buildInputs = [
        pkgs.nodejs
        pkgs.pnpm
      ];
    };
  };
}
