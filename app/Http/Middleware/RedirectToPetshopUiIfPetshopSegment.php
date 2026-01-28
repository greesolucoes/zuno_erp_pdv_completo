<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectToPetshopUiIfPetshopSegment
{
    public function handle(Request $request, Closure $next): Response
    {
        $isPetshopSegment = $this->isPetshopSegment();
        view()->share('isPetshopSegment', $isPetshopSegment);

        if (!$isPetshopSegment) {
            return $next($request);
        }

        if (!$this->shouldRedirectToPetshopUi($request)) {
            return $next($request);
        }

        return redirect($this->buildPetshopUiPath($request));
    }

    private function isPetshopSegment(): bool
    {
        $user = Auth::user();
        if (!$user) {
            return false;
        }

        $segmentName = data_get($user, 'empresa.empresa.plano.plano.segmento.nome');
        if (!$segmentName) {
            return false;
        }

        return mb_strtolower(trim((string) $segmentName)) === 'petshop';
    }

    private function shouldRedirectToPetshopUi(Request $request): bool
    {
        if (!in_array($request->method(), ['GET', 'HEAD'], true)) {
            return false;
        }

        if ($request->expectsJson()) {
            return false;
        }

        $accept = (string) $request->header('Accept', '');
        if ($accept !== '' && !str_contains($accept, 'text/html') && !str_contains($accept, 'application/xhtml+xml')) {
            return false;
        }

        $path = ltrim($request->path(), '/');

        if (str_starts_with($path, 'petshop-ui')) {
            return false;
        }

        if ($path === '' || $path === '/') {
            return true;
        }

        if (
            str_starts_with($path, 'assets/') ||
            str_starts_with($path, 'img/') ||
            str_starts_with($path, 'fonts/') ||
            $path === 'vite.svg'
        ) {
            return false;
        }

        if (str_starts_with($path, 'api/') || str_starts_with($path, 'petshop/api')) {
            return false;
        }

        return true;
    }

    private function buildPetshopUiPath(Request $request): string
    {
        $path = ltrim($request->path(), '/');

        // Preserve the user's intended URL inside the SPA base path.
        $target = $path === '' ? '/petshop-ui' : ('/petshop-ui/' . $path);
        $qs = $request->getQueryString();

        return $qs ? ($target . '?' . $qs) : $target;
    }
}

