const db = require('../models'),
  mtg = require('mtgsdk');

module.exports.index = (req, res) => {
  res.send('Welcome to the cards route!!');
};

//Getting cards by MUID
module.exports.getByMUID = async (req, res) => {
  let card = await db.Card.findOne({ multiverseid: req.params.id });

  res.send(JSON.stringify(card));
};

//Get all cards from MTG
module.exports.getAllCards = async (req, res) => {
  const allCards = await db.Card.find({});

  res.send(JSON.stringify(allCards));
};

//Add cards to DB
module.exports.addCardToDB = async (req, res) => {
  const { name } = req.params;
  const product = await mtg.card.where({ name: name });
  const prodname = product[0]['name'];
  const colors = product[0]['colors'];
  const type = product[0]['type'];
  const imgUrl = product[2]['imageUrl'];

  const addedCard = new db.Card({
    name: prodname,
    colors: colors,
    type: type,
    image: imgUrl
  });
  await addedCard.save(function (err) {
    if (err) res.send('There was an error');
  });
  res.send('Saved the record! Well done!');
  //res.send(JSON.stringify(product, null, 2));
};

module.exports.searchByName = async (req, res) => {
  const { name } = req.params;
  const products = await mtg.card.where({ name: name });

  let cards = [];

  for (let i in products) {
    let item = products[i];
    //validation on multiverse id
    if (item.imageUrl) {
      cards.push({
        name: item.name,
        colors: item.colors,
        type: item.type,
        imgUrl: item.imageUrl,
        id: item.multiverseid,
        description: item.text,
        supertypes: item.supertypes,
        types: item.types,
        rarity: item.rarity,
        manaCost: item.manaCost
      });
    }
  }

  res.send(JSON.stringify(cards));
};
