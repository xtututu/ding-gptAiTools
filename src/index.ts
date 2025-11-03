import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode,AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// 通过addDomainList添加请求接口的域名
fieldDecoratorKit.setDomainList(['api.exchangerate-api.com','token.yishangcloud.cn','open.feishu.cn','pay.xunkecloud.cn']);

fieldDecoratorKit.setDecorator({
   name: 'AI 对话(GPT)',
  // 定义捷径的i18n语言资源
  i18nMap: {
    'zh-CN': {
        'modelSelection': '选择模型',
        'inputCommand': '输入指令',
        'outputResult': '输出结果',
      },
      'en-US': {
        'modelSelection': 'Model selection',
        'inputCommand': 'Input command',
        'outputResult': 'Output result',
      },
      'ja-JP': {
        'modelSelection': 'モデル選択',
        'inputCommand': '入力コマンド',
        'outputResult': '出力結果',
      },
  },
 authorizations: 
    {
      id: 'auth_id',// 授权的id，用于context.fetch第三个参数指定使用
      platform: 'xunkecloud',// 授权平台，目前可以填写当前平台名称
      type: AuthorizationType.HeaderBearerToken, // 授权类型
      required: true,// 设置为选填，用户如果填了授权信息，请求中则会携带授权信息，否则不带授权信息
      instructionsUrl: "http://token.yishangcloud.cn/",// 帮助链接，告诉使用者如何填写这个apikey
      label: '关联账号', // 授权平台，告知用户填写哪个平台的信息
      tooltips: '请配置授权', // 提示，引导用户添加授权
      icon: { // 当前平台的图标
        light: '', 
        dark: ''
      }
    },
  // 定义捷径的入参
  formItems: [
    {
      key: 'modelSelection',
      label: t('modelSelection'),
      component: FormItemComponent.SingleSelect,
      props: {
        defaultValue: 'gpt-5',
        placeholder: '请选择模型',
        options: [
          {
            key: 'gpt-5',
            title: 'gpt-5',
          },
          {
            key: 'gpt-5-mini',
            title: 'gpt-5-mini',
          },
          {
            key: 'gpt-5-thinking',
            title: 'gpt-5-thinking',
          },
          {
            key: 'gpt-5-nano',
            title: 'gpt-5-nano',
          },
          {
            key: 'gpt-4o-mini',
            title: 'gpt-4o-mini',
          },
        ]
      },
      validator: {
        required: true,
      }
    },
    {
      key: 'inputCommand',
      label: t('inputCommand'),
      component: FormItemComponent.FieldSelect,
      props: {
        mode: 'single',
        supportTypes: [FieldType.Text, FieldType.Number,FieldType.SingleSelect,FieldType.MultiSelect],
      },
      validator: {
        required: true,
      }
    }
  ],
  // 定义捷径的返回结果类型
 resultType: {
    type: FieldType.Object,
    extra: {
      properties: [
        {
            key: 'id',
            type: FieldType.Text,
            title: 'id',
            hidden: true
          },
          {
            key: 'outRes',
            type: FieldType.Text,
            title: t('outputResult'),
            primary:true
          },
      ],
      icon: {
        light: 'https://iconlight.png'
      }
    }
  },
  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  execute: async (context, formItemParams: any) => {
    const { modelSelection, inputCommand } = formItemParams;

      function debugLog(arg: any) {
      // @ts-ignore
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ...arg
      }))
    }
    try {
      const createVideoUrl = `http://token.yishangcloud.cn/v1/chat/completions`;
            // 打印API调用参数信息
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelSelection,
                   "messages": [
                              {
                                "role": "developer",
                                "content": "你是一个有帮助的助手。"
                              },
                              {
                                "role": "user",
                                "content": inputCommand
                              }
                            ]
                })
            };
            const taskResp = await context.fetch(createVideoUrl, requestOptions, 'auth_id');


          const initialResult = await taskResp.json();      
           
          // 检查是否有错误
          if (initialResult.error) {
            debugLog({
              type: 'error',
              message: initialResult.error.message,
              code: initialResult.error.code,
              errorType: initialResult.error.type
            });
            
            return {
              code: FieldExecuteCode.Success,
              data: {
                id: '-',
                outRes: `错误: ${initialResult.error.message}`
              },
              msg: initialResult.error.message
            };
          }
      let aiResult = initialResult.choices[0].message.content;
      return {
        code: FieldExecuteCode.Success,
        data: {// 这里的属性与resultType中的结构对应
          id: '-',
          outRes: aiResult,
          // number: 0,
        },
      };

    } catch (e) {
      console.log('====error', String(e));
      return {
        code: FieldExecuteCode.Error,
      }
    }
  },
});
export default fieldDecoratorKit;
