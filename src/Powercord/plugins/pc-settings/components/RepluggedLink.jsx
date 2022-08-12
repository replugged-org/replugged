const { React, getModule } = require('powercord/webpack');
const AsyncComponent = require('powercord/components/AsyncComponent');

const RepluggedIcon = require('./RepluggedIcon');
const Anchor = AsyncComponent.fromDisplayName('Anchor');
const socialClassNames = getModule(['link', 'socialLinks'], false);

module.exports = ({ className = '', href }) => (
    <Anchor
        title='Replugged'
        href={href}
        className={`${socialClassNames.link} ${className}`}
        rel='author'
        tabindex='-1'
        target='_blank'
    >
        <RepluggedIcon />
    </Anchor>
);
