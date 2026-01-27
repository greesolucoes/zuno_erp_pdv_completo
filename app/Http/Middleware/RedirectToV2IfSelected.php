<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectToV2IfSelected
{
    public function handle(Request $request, Closure $next): Response
    {
        $uiVersion = $this->resolveUiVersion();
        view()->share('uiVersion', $uiVersion);

        if ($uiVersion !== 1) {
            return $next($request);
        }

        if (!$this->shouldRedirectToV2($request)) {
            return $next($request);
        }

        return redirect($this->buildV2Path($request));
    }

    private function resolveUiVersion(): int
    {
        $user = Auth::user();
        if (!$user) {
            return 0;
        }

        return (int) ($user->ui_version ?? 0);
    }

    private function shouldRedirectToV2(Request $request): bool
    {
        if (!in_array($request->method(), ['GET', 'HEAD'], true)) {
            return false;
        }

        if ($request->expectsJson()) return false;

        $accept = (string) $request->header('Accept', '');
        if ($accept !== '' && !str_contains($accept, 'text/html') && !str_contains($accept, 'application/xhtml+xml')) {
            return false;
        }

        $path = ltrim($request->path(), '/');
        if ($path === '' || $path === '/') {
            return true;
        }

        if (str_starts_with($path, 'v2')) {
            return false;
        }

        if (str_starts_with($path, 'assets/') || str_starts_with($path, 'img/') || str_starts_with($path, 'fonts/') || $path === 'vite.svg') {
            return false;
        }

        if (str_starts_with($path, 'api/')) {
            return false;
        }

        return true;
    }

    private function buildV2Path(Request $request): string
    {
        $path = ltrim($request->path(), '/');
        $target = $path === '' ? '/v2' : ('/v2/' . $path);
        $qs = $request->getQueryString();
        return $qs ? ($target . '?' . $qs) : $target;
    }
}
