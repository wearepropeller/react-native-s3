/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"
#import "RNS3TransferUtility.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [[RNS3TransferUtility nativeCredentialsOptions] setObject:@"eu-west-1" forKey:@"region"];
  [[RNS3TransferUtility nativeCredentialsOptions] setObject:[NSNumber numberWithInt:[RNS3TransferUtility credentialType:@"BASIC"]] forKey:@"type"];
  [[RNS3TransferUtility nativeCredentialsOptions] setObject:@"your_access_key_here" forKey:@"access_key"];
  [[RNS3TransferUtility nativeCredentialsOptions] setObject:@"your_secret_key_here" forKey:@"secret_key"];

  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"S3Sample"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (void)application:(UIApplication *)application handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)())completionHandler {
  [RNS3TransferUtility interceptApplication:application
        handleEventsForBackgroundURLSession:identifier
                          completionHandler:completionHandler];
}

@end
