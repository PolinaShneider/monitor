import pycron
import time
import vk_api
from decouple import config
from updater import Target


def two_factor():
    code = input('Code? ')
    return code, True


def main():
    login, password = config('LOGIN'), config('PASSWORD')
    vk_session = vk_api.VkApi(login, password, auth_handler=two_factor)
    vk_session.auth()

    target = Target(vk_session.http)
    vk = vk_session.get_api()

    res = vk.users.get(fields='photo_id')
    target_photo_id = res[0]['photo_id'].split('_')[-1]
    resp = target.change_photo(target_photo_id)
    if resp:
        print('updated photo successfully')

    while True:
        if pycron.is_now('*/15 * * * *'):
            try:
                res = vk.users.get(fields='photo_id')
                target_photo_id = res[0]['photo_id'].split('_')[-1]
                resp = target.change_photo(target_photo_id)
                if resp:
                    print('updated photo successfully')
            except KeyboardInterrupt:
                print('problems updating photo')
            except Exception:
                print('something went terribly wrong')


if __name__ == '__main__':
    main()
