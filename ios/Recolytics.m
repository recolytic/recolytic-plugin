//
//  Recolytics.m
//  recolytics
//
//  Created by Pieter Nielsen on 30/07/2014.
//
//

#import "Recolytics.h"

// COLLECT: user actions on resources
#define CollectUserActionsOnResources @"/api/engine/collect/{apikey}?rxid={resourceId}&t={title}&m={media}&aw={actionWeight}&rxw={resourceWeight}&mid={memberId}"

//RECOMMEND: Suggest a set of resources to the user based on specific recommendation strategy
#define RecommendMostPopularResources @"/api/engine/recommend/np/topn/{apikey}?sc={scope1}&sc={scope2}&l={limit}&sk={skip}&location={location}"
#define RecommendHighPriorityResources @"/api/engine/recommend/np/priorityrx/{apikey}?sc={scope1}&rxwt={weightTHR}&l={limit}&sk={skip}&location={location}"
#define RecommendItemToItemCollaborativeFiltering @"/api/engine/recommend/cf/ii/{apikey}?rxid={resourceId}&sc={isScoped}&l={limit}&sk={skip}&location={location}"
#define RecommendCoOccurence @"/api/engine/recommend/cf/basket/{apikey}?rx={rxid1}&rx={rxid2}&at={actionTHR}&l={limit}&sk={skip}&location={location}"
#define RecommendPersonalizedCoOccurence @"/api/engine/recommend/pcf/basket/{apikey}?rx={rxid1}&rx={rxid2}&at={actionTHR}&l={limit}&sk={skip}&location={location}"
#define RecommendUserToUserCollaborativeFiltering @"/api/engine/recommend/pcf/uu/{apikey}?sc={scope}&mid={memberId}&l={limit}&sk={skip}&location={location}"
#define RecommendGroupRecommender @"/api/engine/recommend/pcf/group/{apikey}&m={mid1}&m={mid2}&l={limit}&sk={skip}&location={location}"
#define RecommendReturnsRecentlyVisitedResources @"/api/engine/recommend/p/recenltyVisited/{apikey}?mid={memberId}&aw={maw}&l={limit}&sk={skip}&location={location}"

//MESURE
#define MesureCaptureUserUptakesAndItsContext @"/api/engine/measure/uptake/{apikey}?rxid={resourceId}&location={location}&strategy={strategy}"

@implementation Recolytics

@end
