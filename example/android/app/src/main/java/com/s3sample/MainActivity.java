package com.s3sample;

import com.facebook.react.ReactActivity;
import com.rnfs.RNFSPackage;
import com.mybigday.rns3.RNS3Package;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import android.os.Bundle;
import com.mybigday.rns3.RNS3TransferUtility;

public class MainActivity extends ReactActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        RNS3TransferUtility.nativeCredentialsOptions.put("region", "eu-west-1");
        RNS3TransferUtility.nativeCredentialsOptions.put("type", RNS3TransferUtility.CredentialType.BASIC);
        RNS3TransferUtility.nativeCredentialsOptions.put("access_key", "your_access_key_here");
        RNS3TransferUtility.nativeCredentialsOptions.put("secret_key", "your_secret_key_here");
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "S3Sample";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new RNFSPackage(), 
            new RNS3Package()
        );
    }
}
