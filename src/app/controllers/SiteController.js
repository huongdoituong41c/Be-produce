class SiteController {
    // [GET] /
    index(req, res) {
        res.send('This is homepage')
    }

    // [POST] /search
    search(req, res) {
        res.send(req.body)
    }
}

module.exports = new SiteController
