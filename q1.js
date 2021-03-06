const event = {
  startDate: '2019-04-11T09:00:00',
  endDate: '2019-04-11T11:30:00',
  customer: '1234567890',
  subscription: 'asdfghjkl',
};

const eventList = [
  {
    startDate: '2019-04-11T09:00:00',
    endDate: '2019-04-11T11:30:00',
    customer: '1234567890',
    subscription: 'asdfghjkl',
  },
  {
    startDate: '2019-04-14T09:00:00',
    endDate: '2019-04-14T11:30:00',
    customer: '1234567890',
    subscription: 'qwertyui',
  },
  {
    startDate: '2019-04-17T09:00:00',
    endDate: '2019-04-17T10:30:00',
    customer: '1234567890',
    subscription: 'qwertyui',
  },
];

const customer = {
  _id: '1234567890',
  identity : { lastname : 'X' },
  subscriptions: [{
    _id: 'qwertyui',
    service: {
      name: 'Aide a l\'autonomie',
      saturdaySurcharge: 10,
      sundaySurcharge: 15,
    },
    versions: [
      { startDate: '2019-02-01T00:00:00', unitTTCPrice: 24 },
      { startDate: '2019-04-15T00:00:00', unitTTCPrice: 22 },
    ],
  }, {
    _id: 'asdfghjkl',
    service: { name: 'Ménage' },
    versions: [
      { startDate: '2019-02-01T00:00:00', unitTTCPrice: 22.3 },
      { startDate: '2019-04-15T00:00:00', unitTTCPrice: 21.7 },
    ],
  }],
  fundings: [{
    subscription: 'qwertyui',
    percentage: 60,
    thirdPartyPayer: 'Hauts de Seine',
  }],
};

function diff_minutes(dt2, dt1)
 {
  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
 }

let subscriptionCurentVersion = function(subscription, date){
  const sortedVersions = subscription.versions.slice().sort((a, b) => b.date - a.date) // copie le tableau des versions, le trie selon la date et le stock dans un autre tableau; le tableau original n'est pas modifié (slice)
  let i = sortedVersions.length - 1
  for (;sortedVersions[i].startDate > date; i--){
  }
  if (i>-1){
    return sortedVersions[i];
  } else {
    console.log('la date rentrée ne correspond pas aux versions')
  }
};

let findSubscription = function (customer, subscriptionId){
  return customer.subscriptions.find(x => x._id === subscriptionId);
}

let findFunding = function (customer, subscriptionId){
  return customer.fundings.find(x => x.subscription === subscriptionId);
}

let event_price = function(event){
  const cus = customer; //dans un cas classique on interrogerait une BD pour avoir les infos du bon beneficiaire 'event.customer', ici on va simplement chercher la variable globale 'customer'
  let startDateObject = new Date(event.startDate);
  let endDateObject = new Date(event.endDate);
  let chargeCustomer = diff_minutes(startDateObject,endDateObject) / 60 * subscriptionCurentVersion(findSubscription(cus,event.subscription),event.startDate).unitTTCPrice;

  if(startDateObject.getDay()==0){  // le dimanche
    chargeCustomer*=(100+findSubscription(cus,event.subscription).service.sundaySurcharge)/100;
  } else if (startDateObject.getDay()==6) { // le samedi
    chargeCustomer*=(100+findSubscription(cus,event.subscription).service.saturdaySurcharge)/100;
  } else { // en semaine   -> ca n'apparait pas dans le JSON mais dans l'énoncé on nous dit que les aides ne sont donné qu'en semaine...
    let funding = findFunding(cus, event.subscription);
    if (funding != undefined){
      return [chargeCustomer*(100-funding.percentage)/100, chargeCustomer*funding.percentage/100, funding.thirdPartyPayer];
    }
  }
  return [chargeCustomer,0, undefined]; //[chargeCustomer, chargeFunder]
}


class bill {
  constructor(customer, thirdPartyPayer, charge) {
    this.customer = customer;
    this.thirdPartyPayer = thirdPartyPayer;
    this.charge = charge;
  }
}

let generateBill = function (eventList) {
  let customerBills = [];
  let thirdPartyPayerBills = [];
  for(var eventIndex in eventList) {
    res = event_price(eventList[eventIndex]);
    var newCustomerBill = new bill(event.customer, res[2], res[0]);
    var newThirdPartyPayerBill = new bill(event.customer, res[2], res[1]);
    if (newCustomerBill.charge > 0){
      customerBills.push(newCustomerBill);
    }
    if (newThirdPartyPayerBill.thirdPartyPayer != undefined) {
      thirdPartyPayerBills.push(newThirdPartyPayerBill);
    }
  }
  return [customerBills, thirdPartyPayerBills];
}



console.log(findSubscription(customer,event.subscription));
console.log(findFunding(customer, event.subscription));
console.log(event_price(event));
console.log(generateBill(eventList));
