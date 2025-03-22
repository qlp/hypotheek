{
  description = "Svelte Effect Nix Template";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs@{ self, nixpkgs, flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];
      
      perSystem = { config, self', inputs', pkgs, lib, system, ... }: {
        packages = let
          packageJSON = lib.importJSON ./package.json;
        in {
          app = pkgs.buildNpmPackage {
            npmDepsHash = "sha256-27tdB41x6kexeQ44wMwGlxpvLS9E7xxaDP99lZcqFfo=";
            src = ./.;
            pname = packageJSON.name;
            inherit (packageJSON) version;
            installPhase = ''
              mkdir -p $out
              cp -r ./build/* $out
            '';
            doCheck = true;
            checkPhase = ''
              npm run test
            '';
            doDist = false;
          };
          default = self'.packages.app;
        };
        
        apps = {
          preview = {
            type = "app";
            program = pkgs.writeShellApplication {
              name = "serve-svelte-app";
              runtimeInputs = [ pkgs.miniserve ];
              text = ''
                miniserve --spa --index index.html --port 8080 ${self'.packages.app}
              '';
            };
          };
          default = self'.apps.preview;
        };
      };
    };
}
