while read line;
do
    eval "$line"
done < ./build_config.txt
versionCode=$versionCode

PACKAGE_VERSION=$(cat ../../../package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $PACKAGE_VERSION" "../App/Info.plist"

BUILD_NUMBER=$(cat ../../../package.json | grep versionCode | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
BUILD_NUMBER=$(expr $BUILD_NUMBER + $versionCode)

/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" "../App/Info.plist"

