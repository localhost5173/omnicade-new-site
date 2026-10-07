{
  description = "omnicade.eu — the player website (SvelteKit 5 + TypeScript, adapter-node)";

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
      version = "1.2.0";

      inherit src;

      nativeBuildInputs = [
        pkgs.nodejs
        pkgs.pnpm
        pkgs.pnpmConfigHook
      ];

      pnpmDeps = pkgs.fetchPnpmDeps {
        inherit (finalAttrs) pname version src;
        fetcherVersion = 4;
        # PR note: bumped for adapter-node + the player pages + geoip-lite.
        # When this hash goes stale, paste the `got:` from the build error
        # here.
        hash = "sha256-YdYW8UzvNezi+aLhkYXjbHlA1B0RNmrVqXub1roXNY8=";
      };

      buildPhase = ''
        runHook preBuild
        pnpm run build
        runHook postBuild
      '';

      # adapter-node output: `node build` runs it, with the site's
      # node_modules alongside (the runtime's express-like deps ride
      # there; see the Dockerfile for the container shape of the same).
      installPhase = ''
        runHook preInstall
        mkdir -p $out/share/omnicade-site
        cp -r build $out/share/omnicade-site/
        cp -r node_modules $out/share/omnicade-site/
        cp package.json $out/share/omnicade-site/
        runHook postInstall
      '';
    });

    # `nix run .#` — build the site and serve it on localhost
    apps.${system} = {
      default = {
        type = "app";
        program = lib.getExe (pkgs.writeShellApplication {
          name = "omnicade-site-serve";
          runtimeInputs = [
            pkgs.nodejs
          ];
          text = ''
            echo "omnicade-site → http://localhost:8123  (Ctrl-C to stop)"
            echo "server-side pages need API_BASE_URL pointing at omnicade-api"
            # adapter-node reads HOST/PORT from the environment (see the
            # Dockerfile), not from CLI flags
            HOST=0.0.0.0 PORT=8123 exec node ${packages.${system}.default}/share/omnicade-site/build
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
