<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UiVersionController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'ui_version' => ['required', 'integer', 'in:0,1'],
        ]);

        $user = Auth::user();
        $user->ui_version = (int) $validated['ui_version'];
        $user->save();

        if ($request->expectsJson()) {
            return response()->json([
                'ok' => true,
                'ui_version' => $user->ui_version,
            ]);
        }

        return redirect()->back();
    }
}

