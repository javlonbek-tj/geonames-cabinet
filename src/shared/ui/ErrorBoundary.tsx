import { Component, type ReactNode } from 'react';
import { Button, Result } from 'antd';

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Result
            status="error"
            title="Xatolik yuz berdi"
            subTitle="Sahifani yangilang yoki keyinroq urinib ko'ring"
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Yangilash
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
