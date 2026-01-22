import React from 'react';

function CopyrightFooter() {
    return (
    <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        fontSize: '11px',
        color: '#FFFFFF',
        width: '100%',
        textAlign: 'center',
        padding: '8px 0',
      }}>
        <a href="https://github.com/Mircas001/sharktalk/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" title="AGPL-3.0" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
          <small>Este site é licenciado sob a AGPLv3</small>
        </a>
        <br />
        <a href="https://github.com/Mircas001/sharktalk/" target="_blank" rel="noopener noreferrer" title="Github" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
          <small>Acesse o código fonte</small>
        </a>
    </div>
    );
}

export default CopyrightFooter;