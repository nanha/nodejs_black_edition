# Node Black Edition 소개
---------------------------

  Node.js 를 알리는 일종의 노이즈 마케팅 입니다. Node.js가 개발자의 기억속에서 사라지지 않게 하기 위해 광고하는 목적을 가지고 있습니다. ㅋㅋㅋ 재미있게 봐주세요. Node Black Edition을 사용해 주셔서 감사합니다.



# 개요
-------

  Node.js를 다루면서 Native module로서 필요가 있을만한 기능이나 외부모듈이 있을경우 이것들을 Native Module로서 탑재하는 것에 목적을 두고 있습니다. npm 없이 기본적으로 require하여 사용할 수 있고, help global function을 사용하여 모듈키워드에 대한 사용방법을 바로 확인할 수 있습니다.


# 외부모듈 탑재할 시 고려할 점
-------------------------------

  외부모듈은 의존성 및 버젼 업데이트 관련 문제가 있을 수 있습니다. Native module로 빌드된 이후에 탑재된 외부모듈의 버젼문제가 있을경우 Node.js Black Edition의 자체 패치를 발행해야한다. 그래서, 외부모듈을 선택할때는 여러파일의 연관성이 있거나, 안정적이지 않은 모듈은 제외하고, 최대한 안정화 되어있는 모듈을 선택해야 한다


# 장점
-------

- npm 으로 설치하고 사용방법을 github에 찾아다니는 번거로움을 없앨 수 있습니다.
- Class, def 함수를 global function으로 설정하여 OOP를 Native 으로 즐길 수 있습니다.
- 작업시 필수적으로 필요할만한 유틸리티를 기본적으로 사용할 수 있습니다.


# 단점
-------

- 만약 Native 으로 컴파일한 모듈의 문제가 발생시 Node.js Black Edition 으로부터 패치를 받아야 함.


# 현재 사용할 수 있는 global function
--------------------------------------

- Class
- def
- help
- information


# 현재 기본적으로 사용가능한 Native Module 목록
-----------------------------------------------

- async: Callback Style을 강조하는 Node.js에서 가독성 있는 코드를 작성하기 위한 필수 모듈
- winston: node.js aaa.js > output.log 이렇게 남기시는 분들에게 충격이 될만한 logging 모듈
- colors: 문자열에 색상을 넣어줄 수 있는 모듈
- mysql: 없어서는 안될 mysql 모듈
- fs_extra: 파일복사 API가 없어? 줸장. fs_extra.copy 모듈
- clog: console.log, info 구분이 안된다. prefix 를 색상을 입혀서 붙여주는 모듈
- node-static: RFC2616 compliant HTTP static-file server module, with built-in caching.
- commander: cli에서 node app를 실행할때 옵션설정을 쉽게 할 수 있는 모듈
- optimist: Light-weight option parsing for node.js
- hashish
- underscore
- traverse
- wordwrap
- step
- fileutils (fs.copy, fs.move)
- glob
- minimatch
- mkdirp
- moment
- restler
- traverse
- underscore
- Array, String prototype 


# 추가로 작업중인 Native Module 목록
-----------------------------------------------

- node_redis: Redis client for node
- xml2js: Simple XML to JavaScript object converter.


# TEST
--------
탑재된 모듈마다 test 디렉토리가 존재하는데, 이를 적당히 수정하고 취합하여 TEST 결과를 확인할 수 있습니다

- node.js 소스트리에 패키지를 위치시킵니다.
- cd test_black_edition
- make test


# 사용방법
-----------

* 저장소를 clone하여 node.js 소스트리 최상위에서 압축을 해제합니다.
* lib 디렉토리의 라이브러리와 src/node.js 파일이 덮어쓰기 되어지니 참고하세요.
* node.js 를 처음 설치한 경우
  * configure부터 진행
* 기존에 node.js가 설치되어 있다면
  * make, make install 해주시면 됩니다. lib 디렉토리 관련해서만 build 과정이 이루어 집니다.
* 그럼 이제 node 를 실행하시고, 탑재된 Native module를 즐겨보세요.


# DEMO
-----------
<img src="https://p.twimg.com/AoZcb4ICIAMmnW0.png:large">
