<!doctype html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ $title ?? 'Sistema (Petshop)' }}</title>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i"
            rel="stylesheet"
        />

        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <link rel="stylesheet" href="/css/Base.css" />
        <link rel="stylesheet" href="/css/select2.min.css" />

        <script>
            window.__ERP_BOOTSTRAP__ = {
                csrf_token: @json(csrf_token()),
                user: @json(Auth::user()),
                ui: {
                    basePath: "/petshop-ui",
                },
            };
        </script>
    </head>
    <body>
        <div id="app"></div>

        <script src="/js/Base.js"></script>
        <script src="/js/select2.min.js"></script>

        @vite(['resources/js/petshop/src/main.ts'])
    </body>
</html>

