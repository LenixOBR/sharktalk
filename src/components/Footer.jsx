import React from 'react';

function CopyrightFooter() {
    return (
    <div style={{
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        color: '#FFFFFF',
        width: '100%',
        textAlign: 'center',
      }}>
        <a href="https://github.com/Mircas001/sharktalk/blob/main/LICENSE" target="_blank" title="AGPL-3.0" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
          <small>Este site é licenciado sob a AGPLv3</small>
        </a>
        <br />
        <a href="https://github.com/Mircas001/sharktalk/" target="_blank" title="Github" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
          <small>Acesse o código fonte</small>
        </a>
    </div>
    );
}

export default CopyrightFooter;