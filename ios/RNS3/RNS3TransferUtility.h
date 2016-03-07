#import "RCTBridgeModule.h"
#import "RCTEventDispatcher.h"
#import <AWSCore/AWSCore.h>
#import <AWSS3/AWSS3.h>

typedef enum {
  BASIC, COGNITO
} CredentialType;

@interface RNS3TransferUtility : NSObject <RCTBridgeModule>
+ (NSMutableDictionary*)nativeCredentialsOptions;
+ (CredentialType)credentialType: (NSString *)type;
+ (void)interceptApplication: (UIApplication *)application handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)())completionHandler;
@end
