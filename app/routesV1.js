const express = require('express');
const router = express.Router();
const request = require('request');
const _ = require('underscore');

const MYSOCIETY_API_URL = "https://mapit.mysociety.org/postcode/";
var sampleResults = [
  {
    title: "AD:VENTURE - Leeds City Region",
    description: "Provides free business development support and guidance."
  },
  {
    title: "Agri-tech Cornwall - Cornwall and the Isles of Scilly",
    description: "Grants and support to increase research, development and innovation in agritech."
  },
  {
    title: "ART Business Loans - West Midlands",
    description: "Loans for new and existing small businesses to create and safeguard jobs in the West Midlands"
  },
  {
    title: "Arts University Bournemouth Innovation Vouchers",
    description: "Vouchers to access external expertise, facilities and equipment to help your business innovate and grow."
  },
  {
    title: "BCRS Business Loans",
    description: "Loans to help small and medium-sized businesses develop and grow."
  },
  {
    title: "Be inspired at Staffordshire University",
    description: "Offers free support and guidance for graduates of any university in England, Scotland, Wales and Northern Ireland to start a business in Staffordshire."
  },
  {
    title: "Better Business Finance - UK",
    description: "Free, quick and easy access to a directory of approved finance suppliers for UK businesses."
  },
  {
    title: "Big Issue Invest - UK",
    description: "Big Issue Invest helps social enterprises and charities by providing loans and investments."
  },
  {
    title: "Business advice and masterclasses - East of England",
    description: "Advice, workshops, loans and innovation grant services for start-up and trading businesses in Cambridgeshire, Essex, Norfolk and Suffolk"
  },
  {
    title: "Business Cash Advance - UK",
    description: "Alternative financing for UK small business owners."
  },
  {
    title: "Business Development Grant Scheme – Scarborough",
    description: "Grants to help new start-up and established SMEs looking to grow or relocate to the Borough of Scarborough."
  }

];

var ages = [
  null,
  "not started trading",
  "been trading for under a year",
  "been trading for 1-2 years",
  "been trading for 2-5 years",
  "been trading for over 5 years"
];

var description = [
  "Efficient",
  "Innovative",
  "Traditional",
  "Competitive",
  "Stable",
  "Profit-focused",
  "Part of the community",
  "Powered by people",
  "Powered by technology"
];

  // INDUSTRY SELECT MENU
  var industries = [
    null,
    'agriculture-and-food',
    'business-and-finance',
    'construction',
    'education',
    'health',
    'hospitality-and-catering',
    'information-technology-digital-and-creative',
    'life-sciences',
    'manufacturing',
    'mining',
    'real-estate-and-property',
    'science-and-technology',
    'service-industries',
    'transport-and-distribution',
    'travel-and-leisure',
    'utilities-providers',
    'wholesale-and-retail'
  ];

var isLive = process.env.isLive;
var country = "England";
var businessObj = { age: ages[2], size: 5 };

var postcodeLocation = {
  LEP: 'Cornwall and the Isles of Scilly',
  LA: 'Cornwall',
  ONS: 'E06000052',
  url: 'www.ciosgrowthhub.com',
  telephone: '01209 708660',
  email: 'hello@ciosgrowthhub.com',
  blurb: `Examples of eligible businesses include: 
  <br/>
  retail,
  <br/> hospitality & tourism (B&Bs, hotels, cafes, restaurants, etc),
  <br/> health & beauty (hairdressers, beauticians, aesthetics, personal trainers, gyms, etc) 
  <br/> and agriculture (farming, forestry and fisheries).
  <br/>
  <br/>
  This isn’t an exhaustive list. 
  If you’re not sure if your business is eligible, 
  please contact us FREE* on 0844 257 84 50. 
  If it’s not we’ll link you into other support where it’s available.`
/*   Established.
  (Online portal support for all business stages including Pre-starts and Start up;
  one-to-one support for established businesses through team of Growth Hub Connectors
  - ideally 3 years trading but younger will be considered where there is clear growth ambition.) */
        
};

var aimList = [
  null,
  "growing the business",
  "buying new equipment",
  "getting new premises",
  "hiring new staff",
  "research and innovation",
  "marketing products and services",
  "improving cash flow"
];
var typeList = [
  null,
  "getting started",
  "a sole trader",
  "a business owner",
  "a business manager",
  "a partner"
];
/* 
router.get('/', function (req, res, next) {
  res.render('index', {});
});
*/

router.get('/error', function (req, res, next) {
  res.render('error', { content: { error: { message: "Internal server error" } } });
});

router.get('/v1.1/business-stage', function (req, res, next) {
  res.render('v1.1/business-stage',
    {});
});
router.get('/v1.1/business-size', function (req, res, next) {
  res.render('v1.1/business-size',
    {});
});
router.get('/v1.1/business-type', function (req, res, next) {
  res.render('v1.1/business-type',
    {});
});
router.get('/v1.1/find-address', function (req, res, next) {
  res.render('v1.1/find-address',
    {});
});
router.get('/v1.1/business-funding-aim', function (req, res, next) {
  res.render('v1.1/business-funding-aim',
    {});
});
router.get('/v1.1/growing-your-business', function (req, res, next) {
  res.render('v1.1/growing-your-business',
    {});
});
router.get('/v1.1/get-extra-funding', function (req, res, next) {
  res.render('v1.1/get-extra-funding',
    {});
});
router.get('/v1.1/increase-sales-to-existing-customers', function (req, res, next) {
  res.render('v1.1/increase-sales-to-existing-customers',
    {});
});


// for the summary page set specific strings
var displayNames = {
  types_of_support: [],
  business_stages: "",
  industries: [],
  business_sizes: "",
  region_name: "Cornwall",
  region: "Cornwall",
  region_url: "https://www.cioslep.com/",
  website: "https://www.ciosgrowthhub.com/",
  telephone: "01209 708660",
  email: "hello@ciosgrowthhub.com",
  aim: "",
};

router.get('/v1.1/summary', function (req, res, next) {
  var facets = {};
  var params = "";
  /* 
    to research and create a product; 
    to buy technology or equipment; 
    to help with cash flow; 
    to increase production; 
    to set up a new premises; 
    to employ more people; 
    to market our products or services
   */
  var legalStructure = [
    null,
    "Not yet trading",
    "Sole Trader",
    "Private Limited Company (LTD)",
    "Public Limited Company (PLC)",
    "Limited Liability Partnership (LLP)",
    "Guarantee Company (Non Profit)",
    "Limited Partnership"
  ];


  var aim = req.session.data['aim'];

  if (aim) {
    /* if (i===0){
      params = "";
      //params = "?";
    }else{
      params += "&"; 
    } */
    // params += "types_of_support%5B%5D=" + typeArray[i];
    displayNames.aim = aimList[aim];
  }

  //////////////////////////////

  /* 
    var businessType = req.session.data['businessType'];
    //console.log(businessType);
    //console.log(legalStructure[businessType]);
    if(businessType){
        displayNames.region = "London";
        displayNames.region_url = "lep.london/";
    }
      
    var postcode = req.session.data['postcode'];
    //console.log(postcode);
  
    if(postcode){
      var cleaned = postcode.split('%20').join('');
      cleaned = cleaned.split(' ').join('');
      //console.log("GOT CODE " + cleaned)
      displayNames.region =;
    }
  
  
   */

  //////////////////////////////
  var postcode = req.session.data['postcode'];
  //console.log(postcode);

  if (postcode) {
    var cleaned = postcode.split('%20').join('');
    cleaned = cleaned.split(' ').join('');
    cleaned = cleaned.toUpperCase();
    //console.log("GOT CODE " + cleaned)
    //dummy data
    displayNames.region = `Cornwall (${cleaned})`;
    displayNames.region_name = `Cornwall`;
    displayNames.region_url = "https://www.cioslep.com/";
  }

  var businessType = req.session.data['businessType'];
  //console.log(businessType);
  //console.log(legalStructure[businessType]);
  if (businessType) {
    displayNames.businessType = legalStructure[businessType];
  }


  /* 
    // TYPE OF SUPPORT CHECKBOXES
    var types = [
      null,
      "finance",
      "equity",
      "grant",
      "loan",
      "expertise-and-advice",
      "recognition-award",
    ];
  
    var typeOfSupport = req.session.data['typeOfSupport'];
    var typeArray = []
    if(typeOfSupport){
      for (var i=0;i<typeOfSupport.length;i++){
  
        if(typeOfSupport[i]==="7"){
          params ="";
          break;
        }else{
          
          typeArray[i] = types[typeOfSupport[i]];
          if (i===0){
            params = "";
            //params = "?";
          }else{
            params += "&"; 
          }
          params += "types_of_support%5B%5D=" + typeArray[i];
          displayNames.types_of_support.push(typeArray[i].toLowerCase().split("-").join(" "));
        }
      }
    }
   */


  // SIZE RADIO BUTTONS
  var sizes = [null, 'under-10', 'between-10-and-249', 'between-250-and-500', 'over-500'];
  var businessSize = req.session.data['businessSize'];
  if (businessSize) {
    if (params.length === 0) {
      params = "";
      //params = "?";
    } else {
      params += "&";
    }
    params += "business_sizes%5B%5D=" + sizes[businessSize];
    displayNames.business_sizes = sizes[businessSize].toLowerCase().split("-").join(" ");
  }

  // STAGE RADIO BUTTONS
  // kept the stage names here as they are used in the redirect filter
  var stages = [null, 'not-yet-trading', 'start-up', 'established'];
  var stages_display = [null, 'pre-start', 'start-up', 'established'];
  var businessStage = req.session.data['businessStage'];
  if (businessStage) {
    if (params.length === 0) {
      params = "";
      //params = "?";
    } else {
      params += "&";
    }
    params += "business_stages%5B%5D=" + stages[businessStage];
    displayNames.business_stages = stages_display[businessStage];
  }



  var industryType = req.session.data['industryType'];
  var industryArray = [];
  var industryStr = "";
  if (industryType) {
    if (industryType === "0") {
      // do nothing
    } else {
      industryStr = industries[industryType];
      if (params.length === 0) {
        params = "";
        //params = "?";
      } else {
        params += "&";
      }
      params += "industries%5B%5D=" + industryStr;
      displayNames.industries.push(industryStr.toLowerCase().split("-").join(" "));
    }
  }

  // REGION RADIO BUTTONS
  var region = req.session.data['region']
  if (region) {
    region = region;
  }
  if (region) {
    if (params.length === 0) {
      params = "";
      //params = "?";
    } else {
      params += "&";
    }
    params += "regions%5B%5D=" + region.toLowerCase().split(" ").join("-");
    displayNames.regions.push(region);
  }

  if (params.length > 0) {
    facets = getFacets(params);
  }

  // then pass these to the pages to render checks and facets/chips
  res.render('v1.1/summary', {
    facets: facets,
    display: displayNames,
    copy: "copy<br/>goes<br/>here...",
    params: params
  });


});


router.get('/v1.1/results', function (req, res, next) {
  var params = req.session.data['params']
  var url = "https://www.gov.uk/business-finance-support?" + params;
  //console.log("redirect to " + url);
  // redirect to GOV.UK fund finder with filters
  res.redirect(302, url);
});


global.getFacets = function (arr) {
  var params = arr.split("&");

  var facets = {
    types_of_support: { title: "Of Type", listOfItems: [] },
    business_stages: { title: "For Businesses Which Are", listOfItems: [] },
    industries: { title: "For Businesses In", listOfItems: [] },
    business_sizes: { title: "For Businesses With", listOfItems: [] },
    regions: { title: "For Businesses In", listOfItems: [] },
  };

  var len = params.length;
  // loop through params and split out type and values
  // will id check boxes by id eg 'id="types_of_support-finance"'
  for (var i = 0; i < len; i++) {
    var str = params[i];
    // catch str and url encodes 
    str = str.split("%5B%5D=").join("-");
    str = str.split("[]=").join("-");

    // build separate objects to loop through for the faceted chips
    var filters = str.split("-");
    var group = filters[0];
    // remove group name
    filters.shift();
    // recombine
    filters = filters.join("-");
    facets[group].listOfItems.push(filters);
  }

  return facets
}


router.get('/v1.1/factsheet', function (req, res, next) {
  console.log("fact");
  
  var businessStage = req.session.data['businessStage'];
  var results = res.app.locals.data;
  var aim = req.session.data['nl_aim'];
  // some sort of filtering based on the company type
  var stages = [
    null,
    "pre-start",
    "start-up",
    "established"
  ];
  var stageFilter = "";

  // filter results 
  if (businessStage) {
    stageFilter = stages[businessStage];
  } else {
    stageFilter = stages[1];
  }

  results = _.filter(results, function (item) {
    if (item.who) {

      for (var i = 0; i < item.who.length; i++) {
        if (item.who[i] === stageFilter) {
          return item
        }
      }
    }
  });

  // AIM filters?
  displayNames.aim = aimList[aim];

  // do some crude filtering based on aims?
  // eg reset the results arrays for non-applicable results?

  var procurement = _.filter(results, function (item) { return item.category === "Procurement" });
  var support = _.filter(results, function (item) { return item.category === "Business Support" });
  var legal = _.filter(results, function (item) { return item.category === "Legal" });
  var finance = _.filter(results, function (item) { return item.category === "Sources of Finance" });
  var events = _.filter(results, function (item) { return item.category === "Events and Networking" });
  var premises = _.filter(results, function (item) { return item.category === "Premises" });

  var totalSupport = 0;

  // then pass these to the pages to render
  res.render('v1.1/factsheet', {
    results: res.app.locals.data,
    support: support,
    legal: legal,
    finance: finance,
    events: events,
    premises: premises,
    procurement: procurement,
    totalSupport: totalSupport,
    display: displayNames,
    location: postcodeLocation
  });

});


// custom filtered result page
router.get('/v1.1/test', function (req, res, next) {

  // render a local version of the results
  var len;
  var facets;

  if (req._parsedUrl.query) {
    params = req._parsedUrl.query.split("&");
    len = params.length;
    facets = getFacets(params);
  }

  var checks = {};

  // loop through params and split out type and values
  // will id check boxes by id eg 'id="types_of_support-finance"'
  for (var i = 0; i < len; i++) {
    var str = params[i];
    // catch str and url encodes 
    str = str.split("%5B%5D=").join("-");
    str = str.split("[]=").join("-");
    // populate a checks var to pre-tick checkboxes
    checks[str] = true;
  }

  // then pass these to the pages to render checks and facets/chips
  res.render('v1.1/results', {
    results: sampleResults,
    checks: checks,
    facets: facets
  });

});


router.get('/v1.1/postcode', function (req, res, next) {

  if (req.query.postcode) {
    var str = req.query.postcode;
    var cleaned = str.split('%20').join('');
    cleaned = cleaned.split(' ').join('');
    //https://mapit.mysociety.org/postcode/SW1A1AA

    request(MYSOCIETY_API_URL + cleaned, {
      method: "GET",
      headers: {
        'Accept': 'application/json'
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body) {
          dataset = JSON.parse(body);
          res.send(dataset);
        } else {
          res.render('error', { content: { error: { message: "No data from postcode look-up" } } });
        }
      } else {
        res.redirect('/error');
      }
    });

  } else {
    res.send('no data');
  }

});











//////////////////////////////////////////////////////////////////
//
// Version 2.0 prototype
//
//////////////////////////////////////////////////////////////////

router.get('/v2.0/nl', function (req, res, next) {
  res.render('v2.0/nl', {
    isLive: isLive,
    description: description
  });
});

router.get('/v2.0/hmrc_ad', function (req, res, next) {
  res.render('v2.0/hmrc_ad', { content: { error: { message: "Internal server error" } } });
});
router.get('/v2.0/google_ad', function (req, res, next) {
  res.render('v2.0/google_ad', { content: { error: { message: "Internal server error" } } });
});
router.get('/v2.0/companiesHouse_ad', function (req, res, next) {
  res.render('v2.0/companiesHouse_ad', { content: { error: { message: "Internal server error" } } });
});


router.get('/v2.0/nl-country', function (req, res, next) {
  country = "Wales";
  res.render('v2.0/nl-country', {
    isLive: isLive,
    country: country,
    business: businessObj,
    location: postcodeLocation
  });
});


router.get('/v2.0/nl-columns', function (req, res, next) {
  res.render('v2.0/nl-columns', {
    isLive: isLive,
    country: country,
    business: businessObj,
    location: postcodeLocation
  });
});


router.get('/v2.0/nl-growth-hub', function (req, res, next) {
  res.render('v2.0/nl-growth-hub', {
    isLive: isLive,
    display: displayNames,
    location: postcodeLocation
  });
});


router.get('/v2.0/nl-recommendations', function (req, res, next) {
  var results = res.app.locals.data;
  // do some crude filtering based on aims?
  // eg reset the results arrays for non-applicable results?
  var procurement = _.filter(results, function (item) { return item.category === "Procurement" });
  var support = _.filter(results, function (item) { return item.category === "Business Support" });
  var legal = _.filter(results, function (item) { return item.category === "Legal" });
  var finance = _.filter(results, function (item) { return item.category === "Sources of Finance" });
  var events = _.filter(results, function (item) { return item.category === "Events and Networking" });
  var premises = _.filter(results, function (item) { return item.category === "Premises" });
  //var totalSupport = 0;

  // then pass these to the pages to render
  res.render('v2.0/nl-recommendations', {
    isLive: isLive,
    results: res.app.locals.data,
    support: support,
    legal: legal,
    finance: finance,
    events: events,
    premises: premises,
    procurement: procurement,
    //totalSupport: totalSupport,
    //display: displayNames,
    location: postcodeLocation
  });

});


router.get('/v2.0/nl-pre-start', function (req, res, next) {
  res.render('v2.0/nl-pre-start', {
    isLive: isLive,
    business: businessObj,
    country: country,
    location: postcodeLocation
  });
});


router.get('/v2.0/confirmation', function (req, res, next) {
  res.render('v2.0/confirmation', {
    isLive: isLive,
    location: postcodeLocation
  });
});


router.get('/v2.0/nl-branch', function (req, res, next) {
  let businessAge = req.session.data['nl_age'];
  let postcode = req.session.data['nl_postcode'];
  let peopleCount = req.session.data['nl_count'];
  let turnover = req.session.data['nl_turnover'];
  let turnoverChange = req.session.data['nl_turnover_change'];
  let description = req.session.data['nl_description'];
  var isReady = false;

  if (description) {
    if (description.indexOf("Innovative") > -1 || description.indexOf("Competitive") > -1 || description.indexOf("Profit-focused") > -1) {
      isReady = true;
    }
  }

  // SET SOME DEFAULTs
  if (peopleCount === "") {
    peopleCount = 10;
  }
  if (!postcode) {
    postcode = "TR1 1XU";
    country = "All";
  }

  // once we've captured the form data
  // store it for future reference in the templates
  if (businessAge) {
    businessObj.age = ages[businessAge];
  }
  if (peopleCount) {
    businessObj.size = peopleCount;
  }
  businessObj.postcode = postcode;
  businessObj.peopleCount = peopleCount;
  businessObj.description = description;

  if (postcode) {
    var str = postcode;
    var cleaned = str.split('%20').join('');
    cleaned = cleaned.split(' ').join('');

    request(MYSOCIETY_API_URL + cleaned, {
      method: "GET",
      headers: {
        'Accept': 'application/json'
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body) {
          dataset = JSON.parse(body);

          // get the json dataset
          var areas = dataset.areas;
          var selectedLA;

          // loop through all the areas and look for codes that match the ""
          for (var area in areas) {
            //console.log("area "+area);
            //console.log(areas[area].codes);
            
            if (areas[area].codes && areas[area].codes["local-authority-eng"]) {
              // step back up to the parent and extract the actual _gss_ values/
              selectedLA = areas[area].codes.gss;
            }
            //also get the country code for use on the pre-start hand off?
            if (areas[area].country_name !== "-") {
              country = areas[area].country_name
            }
          }

          if (selectedLA) {
            //console.log(selectedLA);
            
            // use this value to look up the name of the LEP
            var lepDictionary = res.app.locals.dictionary;
            postcodeLocation = lepDictionary[selectedLA];
            var hub = res.app.locals.hubs[postcodeLocation.LEP]

              if(postcodeLocation && hub){
                // do the same for LEP contacts
                postcodeLocation.url = hub.url;
    
                postcodeLocation.telephone = hub.telephone;
                if (hub.email !== "") {
                  postcodeLocation.email = hub.email;
                } else {
                  postcodeLocation.email = "adviser@" + hub.url;
                }

              }
          }

          // TRIAGE
          if (businessAge < 3) {
            res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
          } else if (country !== "England") {
            res.redirect('nl-country');               // getting starters & companies under 1 year old
          } else if (peopleCount <= 4) {
            res.redirect('nl-recommendations');           // companies over 1 year old
            //res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
            //res.redirect('nl-one');                     // 'one man band' 
          } else if (turnover > 1 && turnoverChange > 2 && isReady) {   // form vars are strings so could parseInt or turnoverChange==='3'                                 
            res.redirect('nl-growth-hub');              // READY TO SCALE: target audience 
          } else {
            res.redirect('nl-recommendations');         // LOW_PRODUCTIVE: getting neither (!)
          }

        } else {
          res.redirect('/error');

        }
      } else {
        // res.render('error', { content : {error: {message: "There has been an issue with the postcode look-up"}}});

        // Repeat the triage process here with a defaault response to provide a meaningful response
        //console.log("API LIMITS EXCEEDED")
        selectedLA = "Cornwall";
        country = "England";

        if (businessAge < 3) {
          res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
        } else if (country !== "England") {
          res.redirect('nl-country');               // getting starters & companies under 1 year old
        } else if (peopleCount <= 4) {
          res.redirect('nl-recommendations');               // getting starters & companies under 1 year old
          //res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
          //res.redirect('nl-one');                     // 'one man band' 
        } else if (turnover > 1 && turnoverChange > 2 && isReady) {   // form vars are strings so could parseInt or turnoverChange==='3'                                 
          res.redirect('nl-growth-hub');              // READY TO SCALE: target audience 
        } else {
          res.redirect('nl-recommendations');         // LOW_PRODUCTIVE: getting neither (!)
        }

      }
    }
    );
  } else {

  }

});





//////////////////////////////////////////////////////////////////
//
// Version 2.1 prototype
//
//////////////////////////////////////////////////////////////////

router.get('/v2.1/nl', function (req, res, next) {
  res.render('v2.1/nl', {
    isLive: isLive,
    description: description
  });
});


router.get('/v2.1/nl-country', function (req, res, next) {
  //country = "Scotland";
  res.render('v2.1/nl-country', {
    isLive: isLive,
    country: country,
    business: businessObj,
    location: postcodeLocation
  });
});


router.get('/v2.1/nl-columns', function (req, res, next) {
  var results = res.app.locals.data;
  // do some crude filtering based on aims?
  // eg reset the results arrays for non-applicable results?
  var procurement = _.filter(results, function (item) { return item.category === "Procurement" });
  var support = _.filter(results, function (item) { return item.category === "Business Support" });
  var legal = _.filter(results, function (item) { return item.category === "Legal" });
  var finance = _.filter(results, function (item) { return item.category === "Sources of Finance" });
  var events = _.filter(results, function (item) { return item.category === "Events and Networking" });
  var premises = _.filter(results, function (item) { return item.category === "Premises" });


  // then pass these to the pages to render
  res.render('v2.1/nl-columns', {
    isLive: isLive,
    results: res.app.locals.data,
    support: support,
    legal: legal,
    finance: finance,
    events: events,
    premises: premises,
    procurement: procurement,
    location: postcodeLocation,
    country: country,
    business: businessObj
  });
});


router.get('/v2.1/nl-growth-hub', function (req, res, next) {
  res.render('v2.1/nl-growth-hub', {
    isLive: isLive,
    display: displayNames,
    location: postcodeLocation
  });
});


router.get('/v2.1/nl-recommendations', function (req, res, next) {
  var results = res.app.locals.data;
  // do some crude filtering based on aims?
  // eg reset the results arrays for non-applicable results?
  var procurement = _.filter(results, function (item) { return item.category === "Procurement" });
  var support = _.filter(results, function (item) { return item.category === "Business Support" });
  var legal = _.filter(results, function (item) { return item.category === "Legal" });
  var finance = _.filter(results, function (item) { return item.category === "Sources of Finance" });
  var events = _.filter(results, function (item) { return item.category === "Events and Networking" });
  var premises = _.filter(results, function (item) { return item.category === "Premises" });
  //var totalSupport = 0;

  // then pass these to the pages to render
  res.render('v2.1/nl-recommendations', {
    isLive: isLive,
    results: res.app.locals.data,
    support: support,
    legal: legal,
    finance: finance,
    events: events,
    premises: premises,
    procurement: procurement,
    //totalSupport: totalSupport,
    //display: displayNames,
    location: postcodeLocation
  });

});


router.get('/v2.1/nl-pre-start', function (req, res, next) {
  //country= "Wales";
  //postcodeLocation.LA =country;
  res.render('v2.1/nl-pre-start', {
    isLive: isLive,
    business: businessObj,
    country: country,
    location: postcodeLocation
  });
});


router.get('/v2.1/confirmation', function (req, res, next) {
  res.render('v2.1/confirmation', {
    isLive: isLive,
    location: postcodeLocation
  });
});


router.get('/v2.1/nl-branch', function (req, res, next) {
  let businessAge = req.session.data['nl_age'];
  let postcode = req.session.data['nl_postcode'];
  let peopleCount = req.session.data['nl_count'];
  let turnover = req.session.data['nl_turnover'];
  let turnoverChange = req.session.data['nl_turnover_change'];
  let description = req.session.data['nl_description'];
  var isReady = false;

  if (description) {
    if (description.indexOf("Innovative") > -1 || description.indexOf("Competitive") > -1 || description.indexOf("Profit-focused") > -1) {
      isReady = true;
    }
  }

  // SET SOME DEFAULTs
  if (peopleCount === "") {
    peopleCount = 10;
  }
  if (!postcode) {
    postcode = "TR1 1XU";
    country = "All";
  }

  // once we've captured the form data
  // store it for future reference in the templates
  if (businessAge) {
    businessObj.age = ages[businessAge];
  }
  if (peopleCount) {
    businessObj.size = peopleCount;
  }
  businessObj.postcode = postcode;
  businessObj.peopleCount = peopleCount;
  businessObj.description = description;

  if (postcode) {
    var str = postcode;
    var cleaned = str.split('%20').join('');
    cleaned = cleaned.split(' ').join('');

    request(MYSOCIETY_API_URL + cleaned, {
      method: "GET",
      headers: {
        'Accept': 'application/json'
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body) {
          dataset = JSON.parse(body);

          // get the json dataset
          var areas = dataset.areas;
          var selectedLA;
       
          var region = "your area";

          // loop through all the areas and look for codes that match the ""
          for (var area in areas) {
            if (areas[area].codes && areas[area].codes["local-authority-eng"]) {
              // step back up to the parent and extract the actual _gss_ values/
              selectedLA = areas[area].codes.gss;
            }
            // get the region
            if (areas[area].type_name === "European region") {
              region = areas[area].name;
            }
            //also get the country code for use on the pre-start hand off?
            if (areas[area].country_name !== "-") {
              country = areas[area].country_name
            }
          }

          if (selectedLA) {
            // use this value to look up the name of the LEP
            var lepDictionary = res.app.locals.dictionary;
            postcodeLocation = lepDictionary[selectedLA];
            var hub = res.app.locals.hubs[postcodeLocation.LEP]

            if(postcodeLocation && hub){
              // do the same for LEP contacts
              postcodeLocation.url = hub.url;
  
              postcodeLocation.telephone = hub.telephone;
              if (hub.email !== "") {
                postcodeLocation.email = hub.email;
              } else {
                postcodeLocation.email = "adviser@" + hub.url;
              }

            }
          }
          postcodeLocation.region = region;

          // catch other countries
          if (country !== "England") {
            postcodeLocation.LA = country;
          }
          // TRIAGE
          if (businessAge < 3) {
            res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
          } else if (country !== "England") {
            res.redirect('nl-country');                 // getting starters & companies under 1 year old
          } else if (peopleCount <= 4) {
            res.redirect('nl-recommendations');               // getting starters & companies under 1 year old
            //res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
            //res.redirect('nl-one');                     // 'one man band' 
          } else if (turnover > 1 && turnoverChange > 2 && isReady) {   // form vars are strings so could parseInt or turnoverChange==='3'                                 
            res.redirect('nl-growth-hub');              // READY TO SCALE: target audience 
          } else {
            res.redirect('nl-columns');                 // LOW_PRODUCTIVE: getting neither (!)
          }

        } else {
          res.redirect('/error');

        }
      } else {
        // res.render('error', { content : {error: {message: "There has been an issue with the postcode look-up"}}});

        // Repeat the triage process here with a default response to provide a meaningful response
        //console.log("API LIMITS EXCEEDED")
        selectedLA = "Cornwall"; 
        region = "Cornwall"; 
        country = "England";
        // catch other countries
        if (country !== "England") {
          postcodeLocation.LA = country;
        }
        if (businessAge < 3) {
          res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
        } else if (country !== "England") {
          res.redirect('nl-country');               // getting starters & companies under 1 year old
        } else if (peopleCount <= 4) {
          res.redirect('nl-recommendations');               // getting starters & companies under 1 year old
          //res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
          //res.redirect('nl-one');                     // 'one man band' 
        } else if (turnover > 1 && turnoverChange > 2 && isReady) {   // form vars are strings so could parseInt or turnoverChange==='3'                                 
          res.redirect('nl-growth-hub');              // READY TO SCALE: target audience 
        } else {
          res.redirect('nl-columns');         // LOW_PRODUCTIVE: getting neither (!)
        }

      }
    }
    );
  } else {

  }

});








//////////////////////////////////////////////////////////////////
//
// Version 2.2 prototype
//
//////////////////////////////////////////////////////////////////

router.get('/v2.2/nl', function (req, res, next) {
  res.render('v2.2/nl', { /****************************** NB LANDING ***********/
    isLive: isLive,
    industries:industries,
    description: description
  });
});

router.get('/v2.2/nl-landing', function (req, res, next) {
  res.render('v2.2/nl-landing', {
    isLive: isLive,
    industries:industries,
    description: description
  });
});

router.get('/v2.2/nl-growth-hub-details', function (req, res, next) {
  postcodeLocation.blurb = `Examples of eligible businesses include: 
  <br/>
  retail,
  <br/> hospitality & tourism (B&Bs, hotels, cafes, restaurants, etc),
  <br/> health & beauty (hairdressers, beauticians, aesthetics, personal trainers, gyms, etc) 
  <br/> and agriculture (farming, forestry and fisheries).
  <br/>
  <br/>
  This isn’t an exhaustive list. 
  If you’re not sure if your business is eligible, 
  please contact us FREE* on 0844 257 84 50. 
  If it’s not we’ll link you into other support where it’s available.`;

  postcodeLocation.interest = [
    "leadership development",
    "investment potential",
    "developing funding applications",
    "IT/digital",
    "marketing",
    "sales",
    "human resources",
    "business management",
    "financial management"
  ];

  res.render('v2.2/nl-growth-hub-details', {
    isLive: isLive,
    industries:industries,
    description: description,
    location:postcodeLocation
  });
});


router.get('/v2.2/nl-country', function (req, res, next) {
  //country = "Northern Ireland";
  res.render('v2.2/nl-country', {
    isLive: isLive,
    country: country,
    business: businessObj,
    location: postcodeLocation
  });
});


router.get('/v2.2/nl-columns', function (req, res, next) {
  res.render('v2.2/nl-columns', {
    isLive: isLive,
    country: country,
    business: businessObj,
    location: postcodeLocation
  });
});
 

router.get('/v2.2/nl-growth-hub', function (req, res, next) {

  res.render('v2.2/nl-growth-hub', {
    isLive: isLive,
    display: displayNames,
    location: postcodeLocation
  });
});


router.get('/v2.2/nl-recommendations', function (req, res, next) {
  var results = res.app.locals.data;
  // do some crude filtering based on aims?
  // eg reset the results arrays for non-applicable results?
  var procurement = _.filter(results, function (item) { return item.category === "Procurement" });
  var support = _.filter(results, function (item) { return item.category === "Business Support" });
  var legal = _.filter(results, function (item) { return item.category === "Legal" });
  var finance = _.filter(results, function (item) { return item.category === "Sources of Finance" });
  var events = _.filter(results, function (item) { return item.category === "Events and Networking" });
  var premises = _.filter(results, function (item) { return item.category === "Premises" });
  //var totalSupport = 0;

  // then pass these to the pages to render
  res.render('v2.2/nl-recommendations', {
    isLive: isLive,
    results: res.app.locals.data,
    support: support,
    legal: legal,
    finance: finance,
    events: events,
    premises: premises,
    procurement: procurement,
     location: postcodeLocation
  });

});


router.get('/v2.2/nl-pre-start', function (req, res, next) {
  res.render('v2.2/nl-pre-start', {
    isLive: isLive,
    business: businessObj,
    country: country,
    location: postcodeLocation
  });
});


router.get('/v2.2/confirmation', function (req, res, next) {
  res.render('v2.2/confirmation', {
    isLive: isLive,
    location: postcodeLocation
  });
});


router.get('/v2.2/nl-branch', function (req, res, next) {
  let businessAge = req.session.data['nl_age'];
  let postcode = req.session.data['nl_postcode'];
  let peopleCount = req.session.data['nl_count'];
  let turnover = req.session.data['nl_turnover'];
  let turnoverChange = req.session.data['nl_turnover_change'];
  let description = req.session.data['nl_description'];
  var isReady = false;

  if (description) {
    if (description.indexOf("Innovative") > -1 || description.indexOf("Competitive") > -1 || description.indexOf("Profit-focused") > -1) {
      isReady = true;
    }
  }

  // SET SOME DEFAULTs
  if (peopleCount === "") {
    peopleCount = 10;
  }
  if (!postcode) {
    postcode = "TR1 1XU";
    country = "All";
  }

  // once we've captured the form data
  // store it for future reference in the templates
  if (businessAge) {
    businessObj.age = ages[businessAge];
  }
  if (peopleCount) {
    businessObj.size = peopleCount;
  }
  businessObj.postcode = postcode;
  businessObj.peopleCount = peopleCount;
  businessObj.description = description;

  if (postcode) {
    var str = postcode;
    var cleaned = str.split('%20').join('');
    cleaned = cleaned.split(' ').join('');

    request(MYSOCIETY_API_URL + cleaned, {
      method: "GET",
      headers: {
        'Accept': 'application/json'
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body) {
          dataset = JSON.parse(body);

          // get the json dataset
          var areas = dataset.areas;
          var selectedLA;

          // loop through all the areas and look for codes that match the ""
          for (var area in areas) {
            
            if (areas[area].codes && areas[area].codes["local-authority-eng"]) {
              // step back up to the parent and extract the actual _gss_ values/
              selectedLA = areas[area].codes.gss;
            }
            //also get the country code for use on the pre-start hand off?
            if (areas[area].country_name !== "-") {
              country = areas[area].country_name
            }
          }

          if (selectedLA) {
            // use this value to look up the name of the LEP
            var lepDictionary = res.app.locals.dictionary;
            postcodeLocation = lepDictionary[selectedLA];
            var hub = res.app.locals.hubs[postcodeLocation.LEP]

            if(postcodeLocation && hub){
              // do the same for LEP contacts
              postcodeLocation.url = hub.url;
  
              postcodeLocation.telephone = hub.telephone;
              if (hub.email !== "") {
                postcodeLocation.email = hub.email;
              } else {
                postcodeLocation.email = "adviser@" + hub.url;
              }

            }
          }

          //res.redirect('nl-growth-hub-details');              // READY TO SCALE: target audience 

          
          // TRIAGE
          if (businessAge < 3) {
            res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
          } else if (country !== "England") {
            res.redirect('nl-country');                 // getting starters & companies under 1 year old
          } else if (peopleCount <= 4) {
            res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
            //res.redirect('nl-one');                     // 'one man band' 
          } else if (turnover > 1 && turnoverChange > 2 && isReady) {   // form vars are strings so could parseInt or turnoverChange==='3'                                 
            res.redirect('nl-growth-hub-details');              // READY TO SCALE: target audience 
          } else {
            res.redirect('nl-recommendations');                 // LOW_PRODUCTIVE: getting neither (!)
          }
 
        } else {
          res.redirect('/error');

        }
      } else {
        // res.render('error', { content : {error: {message: "There has been an issue with the postcode look-up"}}});

        // Repeat the triage process here with a defaault response to provide a meaningful response
        //console.log("API LIMITS EXCEEDED")
        selectedLA = "Cornwall";
        country = "England";
            
        if (businessAge < 3) {
          res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
        } else if (country !== "England") {
          res.redirect('nl-country');               // getting starters & companies under 1 year old
        } else if (peopleCount <= 4) {
          res.redirect('nl-recommendations');               // getting starters & companies under 1 year old
          //res.redirect('nl-pre-start');               // getting starters & companies under 1 year old
          //res.redirect('nl-one');                     // 'one man band' 
        } else if (turnover > 1 && turnoverChange > 2 && isReady) {   // form vars are strings so could parseInt or turnoverChange==='3'                                 
          res.redirect('nl-growth-hub-details');              // READY TO SCALE: target audience 
        } else {
          res.redirect('nl-recommendations');         // LOW_PRODUCTIVE: getting neither (!)
        }

      }
    }
    );
  } else {

  }

});

module.exports = router
