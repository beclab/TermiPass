package com.terminus.planeta.plugins;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.accounts.AccountManagerFuture;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import androidx.activity.result.ActivityResult;

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2024/06/19
 *     desc   :
 *     version: 1.0
 * </pre>
 */

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "GoogleAuthPlugin")
public class CustomGooglePlugin  extends Plugin {
    private final static String VERIFY_TOKEN_URL = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";
    private final static String FIELD_TOKEN_EXPIRES_IN = "expires_in";
    private final static String FIELD_ACCESS_TOKEN = "accessToken";
    private final static String FIELD_TOKEN_EXPIRES = "expires";

    // see https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSignInStatusCodes#SIGN_IN_CANCELLED
    private final static int SIGN_IN_CANCELLED = 12501;

    public static final int KAssumeStaleTokenSec = 60;

    private GoogleSignInClient googleSignInClient;

    private GoogleSignInOptions.Builder googleSignInBuilder;

    @Override
    public void load() {
        String clientId = getConfig().getString("androidClientId",
                getConfig().getString("clientId",
                        this.getContext().getString(com.codetrixstudio.capacitor.GoogleAuth.capacitorgoogleauth.R.string.server_client_id)));

        boolean forceCodeForRefreshToken = getConfig().getBoolean("forceCodeForRefreshToken", false);

        googleSignInBuilder = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(clientId)
                .requestEmail();

        if (forceCodeForRefreshToken) {
            googleSignInBuilder.requestServerAuthCode(clientId, true);
        }
    }

    @PluginMethod()
    public void signIn(PluginCall call) {
        Intent signInIntent = googleSignInClient.getSignInIntent();
        startActivityForResult(call, signInIntent, "signInResult");
    }

    @ActivityCallback
    protected void signInResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        Task<GoogleSignInAccount> completedTask = GoogleSignIn.getSignedInAccountFromIntent(result.getData());

        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);

            // The accessToken is retrieved by executing a network request against the Google API, so it needs to run in a thread
            ExecutorService executor = Executors.newSingleThreadExecutor();
            executor.execute(() -> {
                try {
                    JSONObject accessTokenObject = getAuthToken(account.getAccount(), true);

                    JSObject authentication = new JSObject();
                    authentication.put("idToken", account.getIdToken());
                    authentication.put(FIELD_ACCESS_TOKEN, accessTokenObject.get(FIELD_ACCESS_TOKEN));
                    authentication.put(FIELD_TOKEN_EXPIRES, accessTokenObject.get(FIELD_TOKEN_EXPIRES));
                    authentication.put(FIELD_TOKEN_EXPIRES_IN, accessTokenObject.get(FIELD_TOKEN_EXPIRES_IN));

                    JSObject user = new JSObject();
                    user.put("serverAuthCode", account.getServerAuthCode());
                    user.put("idToken", account.getIdToken());
                    user.put("authentication", authentication);

                    user.put("name", account.getDisplayName());
                    // Deprecated: Use `user` instead of `displayName`
                    user.put("displayName", account.getDisplayName());
                    user.put("email", account.getEmail());
                    user.put("familyName", account.getFamilyName());
                    user.put("givenName", account.getGivenName());
                    user.put("id", account.getId());
                    user.put("imageUrl", account.getPhotoUrl());

                    call.resolve(user);
                } catch (Exception e) {
                    e.printStackTrace();
                    call.reject("Something went wrong while retrieving access token", e);
                }
            });
        } catch (ApiException e) {
            if (SIGN_IN_CANCELLED == e.getStatusCode()) {
                call.reject("The user canceled the sign-in flow.", "" + e.getStatusCode());
            } else {
                call.reject("Something went wrong", "" + e.getStatusCode());
            }
        }
    }

    @PluginMethod()
    public void refresh(final PluginCall call) {
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getContext());
        if (account == null) {
            call.reject("User not logged in.");
        } else {
            try {
                JSONObject accessTokenObject = getAuthToken(account.getAccount(), true);

                JSObject authentication = new JSObject();
                authentication.put("idToken", account.getIdToken());
                authentication.put(FIELD_ACCESS_TOKEN, accessTokenObject.get(FIELD_ACCESS_TOKEN));
                authentication.put("refreshToken", "");
                call.resolve(authentication);
            } catch(Exception e){
                e.printStackTrace();
                call.reject("Something went wrong while retrieving access token", e);
            }
        }
    }

    @PluginMethod()
    public void signOut(final PluginCall call) {
        googleSignInClient.signOut()
                .addOnFailureListener(task -> {
                    Log.d("???", "signOut: " + task);
                })
                .addOnCompleteListener(task -> {
                    Log.i("??", "signOut: " + task);
                    if (task.isSuccessful()) {
                        call.resolve();
                    } else {
                        Exception exception = task.getException();
                        if (exception instanceof ApiException) {
                            ApiException apiException = (ApiException) exception;
                            int statusCode = apiException.getStatusCode();
                            call.reject(GoogleSignInStatusCodes.getStatusCodeString(statusCode));
                        } else {
                            call.reject("Sign out failed",exception);
                        }
                    }
                });
    }

    @PluginMethod()
    public void initialize(PluginCall call) {
        JSArray scopeArray = call.getArray("scopes");
        try {
            String[] scopeNames = new String[scopeArray.length()];
            for (int i = 0; i < scopeArray.length(); i++) {
                scopeNames[i] = scopeArray.getString(i);
            }
            Log.i("TEST", "initialize scopeArray : " + Arrays.toString(scopeNames));
            Scope[] scopes = new Scope[scopeNames.length - 1];
            Scope firstScope = new Scope(scopeNames[0]);
            for (int i = 1; i < scopeNames.length; i++) {
                scopes[i - 1] = new Scope(scopeNames[i]);
            }
            googleSignInBuilder.requestScopes(firstScope, scopes);

            GoogleSignInOptions googleSignInOptions = googleSignInBuilder.build();
            googleSignInClient = GoogleSignIn.getClient(this.getContext(), googleSignInOptions);
            call.resolve();
        } catch (JSONException e) {
            e.printStackTrace();
            Log.i("TEST", "initialize failure: " + e.getMessage());
            call.reject("initialize failure : " + e.getMessage());
        }
    }

    // Logic to retrieve accessToken, see https://github.com/EddyVerbruggen/cordova-plugin-googleplus/blob/master/src/android/GooglePlus.java
    private JSONObject getAuthToken(Account account, boolean retry) throws Exception {
        AccountManager manager = AccountManager.get(getContext());
        AccountManagerFuture<Bundle> future = manager.getAuthToken(account, "oauth2:profile email", null, false, null, null);
        Bundle bundle = future.getResult();
        String authToken = bundle.getString(AccountManager.KEY_AUTHTOKEN);
        try {
            return verifyToken(authToken);
        } catch (IOException e) {
            if (retry) {
                manager.invalidateAuthToken("com.google", authToken);
                return getAuthToken(account, false);
            } else {
                throw e;
            }
        }
    }

    private JSONObject verifyToken(String authToken) throws IOException, JSONException {
        URL url = new URL(VERIFY_TOKEN_URL + authToken);
        HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
        urlConnection.setInstanceFollowRedirects(true);
        String stringResponse = fromStream(new BufferedInputStream(urlConnection.getInputStream()));
    /* expecting:
    {
      "issued_to": "xxxxxx-xxxxxxxxxxxxxxx.apps.googleusercontent.com",
      "audience": "xxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com",
      "user_id": "xxxxxxxxxxxxxxxxxxxx",
      "scope": "https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/userinfo.profile",
      "expires_in": 3220,
      "email": "xxxxxxx@xxxxx.com",
      "verified_email": true,
      "access_type": "online"
     }
    */

        Log.d("AuthenticatedBackend", "token: " + authToken + ", verification: " + stringResponse);
        JSONObject jsonResponse = new JSONObject(stringResponse);
        int expires_in = jsonResponse.getInt(FIELD_TOKEN_EXPIRES_IN);
        if (expires_in < KAssumeStaleTokenSec) {
            throw new IOException("Auth token soon expiring.");
        }
        jsonResponse.put(FIELD_ACCESS_TOKEN, authToken);
        jsonResponse.put(FIELD_TOKEN_EXPIRES, expires_in + (System.currentTimeMillis() / 1000));
        return jsonResponse;
    }

    private static String fromStream(InputStream is) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
        }
        reader.close();
        return sb.toString();
    }
}