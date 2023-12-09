const express = require('express')
const { engine } = require('express-handlebars')
const fs = require('fs');
const path = require('path');
const app = express()
const port = 3000

app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })) 

const dataFilePath = path.join(__dirname, 'data.json') 


let urlData = {};
if (fs.existsSync(dataFilePath)) { 
   try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    urlData = JSON.parse(data);
  } catch (error) {
    console.error('無法解析 data.json:', error);
  }
}

app.post('/shorten', (req, res) => {
  const originalURL = req.body.inputURL;

  if (!originalURL) {
    res.render('index');
    return;
  }

  // 檢查原始網址是否已經有對應的縮短網址
  if (urlData[originalURL]) {
    const shortURL = urlData[originalURL];
    res.render('index', { shortURL });
  } else {

    const shortURL = Math.random().toString(36).substring(2, 7);
    
    // 保存縮短的網址
    urlData[originalURL] = shortURL;
    fs.writeFileSync(dataFilePath, JSON.stringify(urlData), 'utf-8');
    
    res.render('index', { shortURL });
  }
});

app.get('/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL; 
  let originalURL
  for (const key in urlData) {
    if (urlData[key] === shortURL) {
      originalURL = key;
      break;
    }
  }

  if (originalURL) {
    res.redirect(originalURL);
  } else {
    res.status(404).send('短網址未找到');
  }
});

app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})
