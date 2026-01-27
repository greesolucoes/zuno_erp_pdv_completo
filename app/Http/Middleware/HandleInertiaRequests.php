<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'inertia.v2';

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'ui' => [
                'version' => $request->user()?->ui_version ?? 0,
                'v2BasePath' => '/v2',
            ],
        ]);
    }
}
