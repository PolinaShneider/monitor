import requests as req


class Target:
    def __init__(self, session):
        s = session
        s.headers['content-type'] = 'application/x-www-form-urlencoded'
        s.headers['x-requested-with'] = 'XMLHttpRequest'
        self.id = '257580685'
        self.s = s

    def get_hash(self, pid):
        photo_id = '%s_%s' % (self.id, pid)
        data = {
            'act': 'show',
            'photo': photo_id,
            'al': 1,
            'module': 'profile'
        }
        r = self.s.post('https://vk.com/al_photos.php', data)
        j = r.json()['payload'][1][3]

        hs = [x['peHash'] for x in j if x['id'] == photo_id][0]
        return hs

    def change_photo(self, pid):
        path = './resized/image.jpeg'
        data = {'act': 'get_editor', 'al': 1,
                'photo_id': '%s_%s' % (self.id, pid),
                'hash': self.get_hash(pid)}
        res = self.s.post('https://vk.com/al_photos.php', data)
        url = res.json()['payload'][1][0]['uploadUrl']

        photo = upload_photo(path, url)

        data = {
            'act': 'pe_save',
            'al': 1,
            '_query': photo,
            'hash': data['hash'],
            'photo': data['photo_id'],
            'texts': ''
        }
        res = self.s.post('https://vk.com/al_photos.php', data)
        if 'ошибка' in res.text.lower():
            return res, photo


def upload_photo(path, server):
    if isinstance(path, str):
        with open(path, 'rb') as f:
            r = req.post(server, files={'file0': ('edited_NaN.jpg', f)}).text
    else:
        r = req.post(server, files={'file0': ('edited_NaN.jpg', path)}).text
    return r
