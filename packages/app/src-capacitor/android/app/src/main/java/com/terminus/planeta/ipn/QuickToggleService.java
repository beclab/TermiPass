// Copyright (c) 2020 Tailscale Inc & AUTHORS All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package com.terminus.planeta.ipn;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

import androidx.annotation.RequiresApi;

@RequiresApi(api = Build.VERSION_CODES.N)
public class QuickToggleService extends TileService {
	// lock protects the static fields below it.
	private static Object lock = new Object();
	// Active tracks whether the VPN is active.
	private static boolean active;
	// Ready tracks whether the tailscale backend is
	// ready to switch on/off.
	private static boolean ready;
	// currentTile tracks getQsTile while service is listening.
	private static Tile currentTile;

	@Override public void onStartListening() {
		synchronized (lock) {
			currentTile = getQsTile();
		}
		updateTile();
	}

	@Override public void onStopListening() {
		synchronized (lock) {
			currentTile = null;
		}
	}

	@Override public void onClick() {
		boolean r;
		synchronized (lock) {
			r = ready;
		}
		if (r) {
			onTileClick();
		} else {
			// Start main activity.
			Intent i = getPackageManager().getLaunchIntentForPackage(getPackageName());
			startActivityAndCollapse(i);
		}
	}

	private static void updateTile() {
		Tile t;
		boolean act;
		synchronized (lock) {
			t = currentTile;
			act = active && ready;
		}
		if (t == null) {
			return;
		}
		t.setState(act ? Tile.STATE_ACTIVE : Tile.STATE_INACTIVE);
		t.updateTile();
	}

	public static void setReady(Context ctx, boolean rdy) {
		synchronized (lock) {
			ready = rdy;
		}
		updateTile();
	}

	public static void setStatus(Context ctx, boolean act) {
		synchronized (lock) {
			active = act;
		}
		updateTile();
	}

	private static native void onTileClick();
}
