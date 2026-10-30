import { Component, type ReactNode } from "react";
export class ModelErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="viewer-error">
        3D is unavailable. You can still explore the research and robot demos.
      </p>
    ) : (
      this.props.children
    );
  }
}
