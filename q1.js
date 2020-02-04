const customer = {
  _id: '1234567890',
  identity : { lastname : 'X' },
  subscription: {
    _id: 'qwertyuio',
    service: {
      name: 'Aide a l\'autonomie',
    },
    versions: [
      { startDate: '2019-02-01T00:00:00', unitTTCPrice: 24 },
      { startDate: '2019-04-15T00:00:00', unitTTCPrice: 22 },
    ],
  },
};

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

console.log(subscriptionCurentVersion(customer.subscription,'2019-03-15T00:00:00'));
console.log(subscriptionCurentVersion(customer.subscription,'2019-05-15T00:00:00'));
