const express = require('express'),
  router = express.Router(),
  mtg = require('mtgsdk');

router.get('/', (req, res) => {
  res.send('Welcome to the sets route');
});

router.get('/:name', async (req, res) => {
  const { name } = req.params;
  const product = await mtg.set.where({ name: name });

  res.send(JSON.stringify(product, null, 2));
});

router.get('/:name/cards', async (req, res) => {
  console.log('name: ' + req.params.name);
  const { name } = req.params;
  const products = await mtg.card.where({ setName: name });
  let cards = [];

  for (let i in products) {
    let item = products[i];

    cards.push({
      name: item.name,
      colors: item.colors,
      type: item.type,
      imgUrl: item.imageUrl
    });
  }
  res.send(JSON.stringify(cards));
});

module.exports = router;
