/* eslint-disable no-case-declarations */
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Spinner, FormNotice, AsyncComponent } = require('powercord/components');
const { WEBSITE } = require('powercord/constants');
const { get } = require('powercord/http');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));

const documentCache = {};

class DocPage extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      document: documentCache[this.key]
    };
  }

  get key () {
    return `${this.props.category}/${this.props.doc}`;
  }

  async componentDidMount () {
    const baseUrl = powercord.settings.get('backendURL', WEBSITE);
    const document = await get(`${baseUrl}/api/v1/docs/${this.props.category}/${this.props.doc}`).then(res => res.body);
    documentCache[this.key] = document;
    this.setState({ document });
  }

  render () {
    const { modules: { hljs, markup } } = this.props;
    const { document } = this.state;
    if (!document) {
      return <Spinner/>;
    }

    const render = [];
    document.contents.forEach(element => {
      switch (element.type) {
        case 'TITLE':
          render.push(React.createElement(`h${element.depth}`, {
            id: element.content.replace(/[^\w]+/ig, '-').replace(/^-+|-+$/g, '').toLowerCase()
          }, element.content));
          break;
        case 'TEXT':
          render.push(React.createElement('p', null, this._mdToReact(element.content)));
          break;
        case 'LIST':
          render.push(React.createElement(element.ordered ? 'ol' : 'ul', null, element.items.map(this._renderList.bind(this, element.ordered))));
          break;
        case 'NOTE':
          render.push(
            <FormNotice
              type={FormNotice.Types[element.color === 'INFO' ? 'PRIMARY' : element.color]}
              body={this._mdToReact(element.content)}
            />
          );
          break;
        case 'CODEBLOCK':
          let className,
            Code;
          if (element.lang) {
            className = `hljs ${element.lang}`;
            Code = () => React.createElement('div', {
              dangerouslySetInnerHTML: {
                __html: hljs.highlight(element.lang, element.code).value
              }
            });
          } else {
            className = 'hljs';
            Code = () => React.createElement('div', null, element.code);
          }
          render.push(<pre className={markup}>
            <code className={className}>
              <Code/>
              {element.lang && <div className='powercord-codeblock-lang'>{element.lang}</div>}
              <div className='powercord-lines'/>
              <button className='powercord-codeblock-copy-btn' onClick={this._handleCodeCopy}>copy</button>
            </code>
          </pre>);
          break;
        case 'TABLE':
          render.push(<table cellSpacing='0'>
            <tr>
              {element.thead.map((th, i) =>
                <th key={`th-${i}`}>{this._mdToReact(th)}</th>
              )}
            </tr>
            {element.tbody.map((tr, i) => <tr key={`tr-${i}`}>
              {tr.map((td, i) => <td key={`td-${i}`} style={element.center[i] ? { textAlign: 'center' } : null}>
                {this._mdToReact(td)}
              </td>)}
            </tr>)}
          </table>);
      }
    });

    // render
    return <div>
      <FormTitle tag='h2' className='powercord-docs-title'>{document.name}</FormTitle>
      <div className='powercord-docs'>{render}</div>
    </div>;
  }

  _renderList (ordered, item) {
    if (typeof item === 'string') {
      return React.createElement('li', null, this._mdToReact(item));
    } else if (Array.isArray(item)) {
      return React.createElement(ordered ? 'ol' : 'ul', null, item.map(this._renderList.bind(this, ordered)));
    }
    return null;
  }

  _mdToReact (md) {
    const react = this.props.modules.markdown.markdownToReact(md, { inline: true });
    return this._transformReact(react[0].props.children);
  }

  _transformReact (react) {
    return react.map(c => {
      if (c.type === 'a') {
        // @todo: Deeplinks once it's ready (?)
        if (c.props.href.startsWith('#')) {
          const { href } = c.props;
          const [ section, part ] = href.substr(1).split('##');
          c.props.onClick = () => {
            this.props.setSection(section);
            if (part) {
              setImmediate(() => this.props.onScrollTo(part));
            }
          };
          c.props.href = '#';
        } else {
          c.props.target = '_blank';
        }
      } else if (c.props && Array.isArray(c.props.children)) {
        c.props.children = this._transformReact(c.props.children);
      }
      return c;
    });
  }

  _handleCodeCopy (e) {
    powercord.pluginManager.get('pc-codeblocks')._onClickHandler(e);
  }
}

let modules;
module.exports = (props) => <AsyncComponent
  _provider={async () => {
    if (!modules) {
      modules = {
        hljs: await getModule([ 'highlight' ]),
        markdown: await getModule([ 'markdownToHtml' ]),
        markup: (await getModule([ 'markup' ])).markup
      };
    }
    return () => <DocPage modules={modules} {...props}/>;
  }}
/>;
