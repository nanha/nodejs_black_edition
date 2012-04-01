Node.js Black Edition (include native module, not file load, not npm) 소개
------------------------

  Node.js 를 알리는 노이즈 마케팅 패키지 입니다. Node.js가 기억속에서 사라지지 않도록 널리 알리는 목적을 가지고 있습니다. :) 재미있게 봐주세요. Node Black Edition을 사용해 주셔서 감사합니다.
  
  **참고로 실무에 nodeqa.com, 메신저 프로젝트에 이것을 도입했습니다**


동기
-------

  저는 Node.js 으로 프로젝트를 진행하면서 "아~ 대표적인 Module은 많은데, __소소한 Native Module__ 이 있었으면 좋겠는데~" 라고 느꼈을때가 종종 있었습니다. 현재 Node.js의 기본 취지에 맞게 다양한 Native Module을 제공하고 있으나, 제 입장에서는 좀 부족한 느낌이 들더군요. 그래서 이 프로젝트를 진행하게 되었습니다. 


개요
-------

  Node.js에 유용한 확장 모듈을 native module 로 추가하고 이에 대한 Help 함수를 제공하는데 목적이 있습니다. **npm 설치 없이** require하여 사용할 수 있고, **help global function**을 사용하여 모듈키워드에 대한 사용방법을 바로 확인할 수 있습니다.



외부모듈 탑재할 시 고려할 점
-------------------------------

  외부모듈은 의존성 및 버젼 업데이트 관련 문제가 있을 수 있습니다. Native module로 빌드된 이후에 탑재된 외부모듈의 버젼문제가 있을경우 Node.js Black Edition의 패치가 진행되어야 합니다. 그래서, 외부모듈을 선택할때는 여러파일의 연관성이 있거나, 안정적이지 않은 모듈은 제외하고, 최대한 안정화 되어있는 모듈을 선택해야 합니다.


장점
-----

- Native Module로서 탑재되었기 때문에, require시에 **파일로드 과정을 거치지 않습니다.**
- Python과 같이 help함수를 지원하기 때문에, npm 으로 설치하고, 사용방법을 github에 찾아다니는 번거로움을 없앨 수 있습니다.
- Class, def 함수를 global function으로 설정하여 OOP를 Native 으로 즐길 수 있습니다.
- 작업시 필수적으로 필요할만한 유틸리티를 기본적으로 사용할 수 있습니다.


단점
-----


- 만약 Native 으로 컴파일한 모듈의 문제가 발생시 Node.js Black Edition 으로부터 패치를 받아야 함. (Module의 엄격한 심사로 이런일이 없도록 하겠습니다.)




설치방법
-----------
* 현재 리눅스(bsd 제외) 플랫폼에서만 지원됩니다.
  * cpp native module이 build시점에 포함
  * npm으로 설치할시 플랫폼별로 cppflags 선언하는 스크립트를 src/*.cc와 같이 빌드할 수 없음. (fiber의 platform.mk참조) 
* 저장소를 clone하거나, 압축파일을 다운로드 후, 모든 디렉토리에포함된 파일들을 소스트리에 복사합니다. (이 부분은 자동 스크립트가 필요하거나, 추후 node.js 소스트리에 적용한 전체 패키지 소스를 배포해야함)
* 설치를 진행합니다.

        make distclean
        configure [option]
        make
        make install


사용방법
----------

## cli

### $ nodeman -h
![usage](https://github.com/nanha/nodeman/raw/master/images/nodeman_usage.png)

### $ nodeman -b
![builtin](https://github.com/nanha/nodeman/raw/master/images/nodeman_builtin_list.png)

### $ nodeman optimist
![output](https://photos-1.dropbox.com/btj/4faa6d69/wrJ7qPsDFgAg78-vcNjiIR_GcUqX9rJvkD8n7y2Q7ks/ScreenShot003.jpg?size=1280x960)


## repl

    $ node
    > var man = require('nodeman');
    > man.help('optimist')


