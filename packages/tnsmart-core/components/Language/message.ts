import {
  defineMessages as iDefineMessage,
  MessageDescriptor,
} from 'react-intl';

export type MessageConfig<E> = MessageObject<E>;

export type MessageValue<E> = MessageConfig<E> | E;

export interface MessageObject<E> {
  [key: string]: MessageValue<E>;
}

export const buildMessageDescriptor = (
  msgConfig: MessageConfig<string>,
  parentKey?: string,
): MessageConfig<MessageDescriptor> => {
  const res: any = {};
  for (const key in msgConfig) {
    if (msgConfig.hasOwnProperty(key)) {
      const element = msgConfig[key];
      const id = `${parentKey ? parentKey + '.' : ''}${key}`;
      if (typeof element !== 'string') {
        res[key] = buildMessageDescriptor(element, id);
      } else {
        const desc: MessageDescriptor = {
          id,
          defaultMessage: element,
        };
        res[key] = desc;
      }
    }
  }
  return res;
};

// Force using type of msgConfig for result
export const defineMessages = <C extends MessageConfig<string>>(
  msgConfig: C,
  key?: string,
): C => {
  return buildMessageDescriptor(msgConfig, key) as any;
};
