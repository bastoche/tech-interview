var fs = require('fs');
var data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

var articles = data.articles
var carts = data.carts
var deliveryFees = data.delivery_fees;

function findArticleById(articles, articleId) {
  return articles.find(function(article) {
    return article.id === articleId;
  });
}

function computeDeliveryFees(deliveryFees, itemsPrice) {
  var fee = deliveryFees.find(function(deliveryFee) {
    return deliveryFee.eligible_transaction_volume.min_price <= itemsPrice &&
      (!deliveryFee.eligible_transaction_volume.max_price || itemsPrice < deliveryFee.eligible_transaction_volume.max_price);
  });
  return fee.price;
}

function computeCartTotal(cart) {
  var itemsPrice = cart.items.reduce(function(total, item) {
    var price = findArticleById(articles, item.article_id).price;
    return total + price * item.quantity;
  }, 0);
  var deliveryPrice = computeDeliveryFees(deliveryFees, itemsPrice);
  return itemsPrice + deliveryPrice;
}

var result = {
  "carts": carts.map(function(cart) {
    return { "id": cart.id, "total": computeCartTotal(cart) };
  })
}

fs.writeFile('output.json', JSON.stringify(result, null, 2));