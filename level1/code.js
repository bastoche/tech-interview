var fs = require('fs');
var data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

var articles = data.articles
var carts = data.carts

function findArticleById(articles, articleId) {
  return articles.find(function(article) {
    return article.id === articleId;
  });
}

function computeCartTotal(cart) {
  return cart.items.reduce(function(total, item) {
    var price = findArticleById(articles, item.article_id).price;
    return total + price * item.quantity;
  }, 0);
}

var result = {
  "carts": carts.map(function(cart) {
    return { "id": cart.id, "total": computeCartTotal(cart) };
  })
}

fs.writeFile('output.json', JSON.stringify(result, null, 2));