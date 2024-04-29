// Copyright (c) 2023 Tailscale Inc & AUTHORS All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package com.terminus.planeta.ipn;

import android.content.Context;

import androidx.work.Worker;
import androidx.work.WorkerParameters;

public final class StopVPNWorker extends Worker {

    public StopVPNWorker(
            Context appContext,
            WorkerParameters workerParams) {
        super(appContext, workerParams);
    }

    @Override public Result doWork() {
        IPNApp app = ((IPNApp)getApplicationContext());
        app.ipnClose();
        return Result.success();
    }

}
