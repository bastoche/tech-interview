var fs = require('fs');
var data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

var articles = data.articles
var carts = data.carts
var deliveryFees = data.delivery_fees;
var discounts = data.discounts;

function findArticleById(articles, articleId) {
  return articles.find(function(article) {
    return article.id === articleId;
  });
}

function findDiscountById(discounts, articleId) {
  return discounts.find(function(discount) {
    return discount.article_id === articleId;
  });
}

function applyDiscount(item, price, discount) {
  if (discount.type === "amount") {
    return (price - discount.value) * item.quantity;
  }
  else if (discount.type === "percentage") {
    return (price - Math.round(price * discount.value / 100)) * item.quantity;
  }
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
    return total + computeLine(articles, discounts, item);
  }, 0);
  var deliveryPrice = computeDeliveryFees(deliveryFees, itemsPrice);
  return itemsPrice + deliveryPrice;
}

function computeLine(articles, discounts, item) {
  var price = findArticleById(articles, item.article_id).price;
  var discount = findDiscountById(discounts, item.article_id);
  if (discount) {
    return applyDiscount(item, price, discount);
  }
  else {
    return price * item.quantity;
  }
}

var result = {
  "carts": carts.map(function(cart) {
    return { "id": cart.id, "total": computeCartTotal(cart) };
  })
}

fs.writeFile('output.json', JSON.stringify(result, null, 2));