// Copyright (c) 2023 Tailscale Inc & AUTHORS All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package com.terminus.planeta.ipn;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

public class IPNReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        WorkManager workManager = WorkManager.getInstance(context);

        // On the relevant action, start the relevant worker, which can stay active for longer than this receiver can.
        if (intent.getAction().equals(IPNService.ACTION_CONNECT)) {
            workManager.enqueue(new OneTimeWorkRequest.Builder(StartVPNWorker.class).build());
        } else if (intent.getAction().equals(IPNService.ACTION_DISCONNECT)) {
            workManager.enqueue(new OneTimeWorkRequest.Builder(StopVPNWorker.class).build());
        }
    }
}
