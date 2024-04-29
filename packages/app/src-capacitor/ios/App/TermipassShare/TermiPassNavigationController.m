//
//  TermiPassNavigationController.m
//  TermipassShare
//
//  Created by gjm on 8/9/23.
//

#import "TermiPassNavigationController.h"

@interface TermiPassNavigationController ()

@end

@implementation TermiPassNavigationController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    self.view.transform = CGAffineTransformMakeTranslation(0, self.view.bounds.size.height);
    [UIView animateWithDuration:0.3 delay:0.0 options:UIViewAnimationOptionAllowAnimatedContent | 7 << 16 animations:^{
        self.view.transform = CGAffineTransformIdentity;
    } completion:nil];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
