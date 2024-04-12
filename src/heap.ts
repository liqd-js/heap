type Comparator<T> = ( a: T, b: T ) => number;

export default class Heap<T,I=T>
{
	protected data: T[];
	protected index: Map<I,number> | undefined;
	protected compare: Comparator<T>;
	protected get_id: ( item: T ) => I;
	protected sorted: boolean = true;
	protected updated = new Set<T>();

	constructor( comparator?: Comparator<T>, id_getter?: ( item: T ) => I )
	{
		this.data = new Array();
		this.compare = comparator ? comparator : ( a: T, b: T ) => a < b ? -1 : 1;
		//@ts-ignore
		this.get_id = id_getter ?? ( item => item ) as ( item: T ) => I;
	}

	static from<T,I>( container: Array<T> | Set<T> | Map<any,T>, comparator?: Comparator<T>, id_getter?: ( item: T ) => I )
	{
		let heap = new Heap<T,I>( comparator, id_getter );

		for( const item of container.values() )
		{
			heap.push( item );
		}

		return heap;
	}

	protected sift_up( i: number )
	{
		let pi = ( i - 1 ) >> 1;

		while( i > 0 && this.compare( this.data[i], this.data[pi] ) < 0 )
		{
			let v = this.data[i];
			this.data[i] = this.data[pi];
			this.data[pi] = v;

			if( this.index )
			{
				this.index.set( this.get_id( this.data[i]), i );
				this.index.set( this.get_id( this.data[pi]), pi );
			}

			i = pi;
			pi = ( i - 1 ) >> 1;
		}
	}

	protected sift_down( i: number )
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
					this.index.set( this.get_id( this.data[i]), i );
					this.index.set( this.get_id( this.data[ci]), ci );
				}

				i = ci;
				ci = 2 * i + 1;
			}
			else{ break; }
		}
	}

	protected sift( i: number )
	{
		if( this.data.length < 2 ){ return }

		if( i !== 0 && this.compare( this.data[i], this.data[( i - 1 ) >> 1] ) < 0 )
		{
			this.sift_up( i );
		}
		else
		{
			this.sift_down( i );
		}
	}

	protected reindex()
	{
		this.index = new Map();

		for( let i = 0; i < this.data.length; ++i )
		{
			this.index.set( this.get_id( this.data[i] ), i );
		}
	}

	protected get_item_index( item: T ): number | void
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

				return this.index!.get( this.get_id( item ));
			}
		}
	}

	public get size(): number
	{
		return this.data.length;
	}

	public top(): T | void // "peek"
	{
		if( this.data.length )
		{
			if( !this.sorted ){ this.sort_updated() }

			return this.data[0];
		}
	}

	public push( item: T ): this
	{
		this.data.push( item );

		if( this.index ){ this.index.set( this.get_id( item ), this.data.length - 1 )}

		this.sift_up( this.data.length - 1 );

		return this;
	}

	public pop(): T | void
	{
		if( this.data.length )
		{
			if( !this.sorted ){ this.sort_updated() }

			let last = this.data.pop()!;

			if( this.data.length )
			{
				let top = this.data[0]; this.data[0] = last;

				if( this.index )
				{
					this.index.delete( this.get_id( top ));
					this.index.set( this.get_id( last ), 0 );
				}

				this.sift_down( 0 );

				return top;
			}
			else
			{
				if( this.index ){ this.index.delete( this.get_id( last ))}

				return last;
			}
		}
	}

	public get( id: I ): T | void
	{
		if( this.data.length )
		{
			if( !this.index ){ this.reindex(); }

			const index = this.index!.get( id );
			
			if( index !== undefined )
			{
				return this.data[index];
			}
		}
	}

	public values(): IterableIterator<T>
	{
		return this.data.values();
	}

	public update( item: T ): boolean
	{
		let i = this.get_item_index( item );

		if( i !== undefined )
		{
			this.sorted = false;
			this.updated.add( item );

			if( this.updated.size > Math.max( 10, this.data.length * 0.1 ))
			{
				this.sort_updated();
			}

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

					this.index!.delete( this.get_id( item ));

					if( i < this.data.length )
					{
						this.data[i] = last;
						this.index!.set( this.get_id( last ), i );

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
		this.sorted = true;

		return this;
	}

	protected sort_updated(): void
	{
		for( let item of this.updated )
		{
			this.sift( this.get_item_index( item )! );
		}
	}

	public sort(): this
	{
		for( let i = 0; i < this.data.length; ++i )
		{
			this.sift_up( i );
		}

		this.index && ( this.index = new Map());
		this.updated = new Set<T>();
		this.sorted = true;

		return this;
	}
}
