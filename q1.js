const event = {
  startDate: '2019-04-11T09:00:00',
  endDate: '2019-04-11T11:30:00',
  customer: '1234567890',
};

const customer = {
  _id: '1234567890',
  identity : { lastname : 'X' },
  subscription: {
    _id: 'qwertyuio',
    service: {
      name: 'Aide a l\'autonomie',
      saturdaySurcharge: 10,
      sundaySurcharge: 15,
    },
    versions: [
      { startDate: '2019-02-01T00:00:00', unitTTCPrice: 24 },
      { startDate: '2019-04-15T00:00:00', unitTTCPrice: 22 },
    ],
  },
  funding: { percentage: 60, thirdPartyPayer: 'Hauts de Seine' },
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

let event_price = function(event){
  const cus = customer; //dans un cas classique on interrogerait une BD pour avoir les infos du bon beneficiaire 'event.customer', ici on va simplement chercher la variable globale 'customer'
  let startDateObject = new Date(event.startDate);
  let endDateObject = new Date(event.endDate);
  let chargeCustomer = diff_minutes(startDateObject,endDateObject) / 60 * subscriptionCurentVersion(cus.subscription,event.startDate).unitTTCPrice;
  if(startDateObject.getDay()==0){  // le dimanche
    chargeCustomer*=(100+cus.subscription.service.sundaySurcharge)/100;
  } else if (startDateObject.getDay()==6) { // le samedi
    chargeCustomer*=(100+cus.subscription.service.saturdaySurcharge)/100;
  } else { // en semaine
    if (cus.funding!= undefined){
      return [chargeCustomer*(100-cus.funding.percentage)/100, chargeCustomer*cus.funding.percentage/100]
    }
  }
  return [chargeCustomer,0]; //[chargeCustomer, chargeFunder]
}

console.log(subscriptionCurentVersion(customer.subscription,'2019-03-15T00:00:00'));
console.log(subscriptionCurentVersion(customer.subscription,'2019-05-15T00:00:00'));
console.log(event_price(event));
