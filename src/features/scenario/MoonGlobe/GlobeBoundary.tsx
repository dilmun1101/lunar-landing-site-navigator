import { Component, type ReactNode } from 'react';

interface GlobeBoundaryProps {
  /** Shown if the 3D chunk fails to load or the scene throws */
  fallback: ReactNode;
  children: ReactNode;
}

interface GlobeBoundaryState {
  failed: boolean;
}

/** Keeps a 3D failure (no network for the chunk, a lost GL context) from breaking the page. */
export default class GlobeBoundary extends Component<
  GlobeBoundaryProps,
  GlobeBoundaryState
> {
  state: GlobeBoundaryState = { failed: false };

  static getDerivedStateFromError(): GlobeBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
