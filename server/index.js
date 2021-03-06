require('dotenv').config();

const compression = require('compression');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const user = require('./user');
const github = require('./github');
const pdf = require('./pdf');
const pandoc = require('./pandoc');
const assets = require('./assets');
const lesari = require('./lesari');
const conf = require('./conf');

const resolvePath = pathToResolve => path.join(__dirname, '..', pathToResolve);

const uploadMiddleware = multer({
  storage: multer.memoryStorage({}),
}).any();

module.exports = (app, serveV4) => {
  if (process.env.NODE_ENV === 'production') {
    // Enable CORS for fonts
    app.all('*', (req, res, next) => {
      if (/\.(eot|ttf|woff2?|svg)$/.test(req.url)) {
        res.header('Access-Control-Allow-Origin', '*');
      }
      res.header('Cache-control', 'no-cache');
      next();
    });

    // Use gzip compression
    app.use(compression());
  }


  app.use(bodyParser.json({limit:'50mb', extended: true}));
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true 
  }));

  app.get('/oauth2/githubToken', github.githubToken);
  app.get('/conf', (req, res) => res.send(conf.publicValues));
  app.get('/userInfo', user.userInfo);
  app.post('/pdfExport', pdf.generate);
  app.post('/pandocExport', pandoc.generate);
  app.post('/paypalIpn', bodyParser.urlencoded({
    extended: false,
  }), user.paypalIpn);

  app.get('/assets', assets.listAssets);

  app.post('/pictures', uploadMiddleware, assets.uploadPictures);
  app.get('/pictures', assets.listPictures);
  
  app.post('/publishLesari', lesari.publishLesari);

  // Serve landing.html
  app.get('/', (req, res) => {
    res.redirect('/app');
  });
  // Serve sitemap.xml
  app.get('/sitemap.xml', (req, res) => res.sendFile(resolvePath('static/sitemap.xml')));
  // Serve callback.html
  app.get('/oauth2/callback', (req, res) => res.sendFile(resolvePath('static/oauth2/callback.html')));
  // Google Drive action receiver
  app.get('/googleDriveAction', (req, res) =>
    res.redirect(`./app#providerId=googleDrive&state=${encodeURIComponent(req.query.state)}`));

  // Serve static resources
  if (process.env.NODE_ENV === 'production') {

    // Serve index.html in /app
    app.get('/app', (req, res) => res.sendFile(resolvePath('dist/index.html')));

    // Serve style.css with 1 day max-age
    app.get('/style.css', (req, res) => res.sendFile(resolvePath('dist/style.css'), {
      maxAge: '1d',
    }));

    // Serve the static folder with 1 year max-age
    app.use('/static', serveStatic(resolvePath('dist/static'), {
      maxAge: '1h',
    }));

    app.use(serveStatic(resolvePath('dist')));

  }
};
