type Comparator<T> = ( a: T, b: T ) => number;

export default class Heap<T>
{
	private data: T[];
	private index: Map<T,number> | undefined;
	private compare: Comparator<T>;

	constructor( comparator?: Comparator<T> )
	{
		this.data = new Array();
		this.compare = comparator ? comparator : ( a: T, b: T ) => a < b ? -1 : 1;
	}

	static from<T>( container: Array<T> | Set<T> | Map<any,T>, comparator: Comparator<T> )
	{
		let heap = new Heap<T>( comparator );

		for( const item of container.values() )
		{
			heap.push( item );
		}

		return heap;
	}

	private sift_up( i: number )
	{
		let pi = ( i - 1 ) >> 1;

		while( i > 0 && this.compare( this.data[i], this.data[pi] ) < 0 )
		{
			let v = this.data[i];
			this.data[i] = this.data[pi];
			this.data[pi] = v;

			if( this.index )
			{
				this.index.set( this.data[i], i );
				this.index.set( this.data[pi], pi );
			}

			i = pi;
			pi = ( i - 1 ) >> 1;
		}
	}

	private sift_down( i: number )
	{
		let ci = 2 * i + 1;

		while( ci < this.data.length )
		{
			ci = this.data.length > ci + 1 && this.compare( this.data[ci+1], this.data[ci] ) < 0 ? ci + 1 : ci;

			if( this.compare( this.data[ci], this.data[i] ) < 0 )
			{
				let v = this.data[i];
				this.data[i] = this.data[ci];
				this.data[ci] = v;

				if( this.index )
				{
					this.index.set( this.data[i], i );
					this.index.set( this.data[ci], ci );
				}

				i = ci;
				ci = 2 * i + 1;
			}
			else{ break; }
		}
	}

	private sift( i: number )
	{
		if( i !== 0 && this.compare( this.data[i], this.data[( i - 1 ) >> 1] ) < 0 )
		{
			this.sift_up( i );
		}
		else
		{
			this.sift_down( i );
		}
	}

	private reindex()
	{
		this.index = new Map();

		for( let i = 0; i < this.data.length; ++i )
		{
			this.index.set( this.data[i], i );
		}
	}

	private get_item_index( item: T )
	{
		if( this.data.length )
		{
			if( this.data[0] === item )
			{
				return 0;
			}
			else
			{
				if( !this.index ){ this.reindex(); }

				return this.index!.get( item );
			}
		}

		return undefined;
	}

	public get size(): number
	{
		return this.data.length;
	}

	public top(): T | undefined // "peek"
	{
		return this.data.length ? this.data[0] : undefined;
	}

	public push( item: T ): this
	{
		this.data.push( item );

		if( this.index ){ this.index.set( item, this.data.length - 1 ); }

		this.sift_up( this.data.length - 1 );

		return this;
	}

	public pop(): T | undefined
	{
		if( this.data.length )
		{
			let last = this.data.pop()!;

			if( this.data.length )
			{
				let top = this.data[0]; this.data[0] = last;

				if( this.index )
				{
					this.index.delete( top );
					this.index.set( last, 0 );
				}

				this.sift_down( 0 );

				return top;
			}
			else
			{
				if( this.index ){ this.index.delete( last ); }

				return last;
			}
		}
		else{ return undefined; }
	}

	public update( item: T ): boolean
	{
		let i = this.get_item_index( item );

		if( i !== undefined )
		{
			this.sift( i );

			return true;
		}
		
		return false;
	}

	public delete( item: T ): boolean
	{
		if( this.size )
		{
			let i = this.get_item_index( item );

			if( i !== undefined )
			{
				if( i === 0 )
				{
					this.pop();
				}
				else
				{
					let last = this.data.pop()!;

					this.index!.delete( item );

					if( i < this.data.length )
					{
						this.data[i] = last;
						this.index!.set( last, i );

						this.sift( i );
					}
				}

				return true;
			}
		}
		
		return false;
	}

	public clear(): this
	{
		this.data = new Array();
		this.index = undefined;

		return this;
	}

	public sort(): this
	{
		let data = this.data; this.data = new Array();

		if( this.index ){ this.index = new Map(); }

		for( const item of data )
		{
			this.push( item );
		}

		return this;
	}
}
